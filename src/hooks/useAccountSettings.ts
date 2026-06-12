import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../config/apiClient";
import { authService } from "../services/authService";

export interface AccountData {
  id?: string;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  pin: string;
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
  themePreference: 'light' | 'dark';
}

export function useAccountSettings() {
  const { username, email, updateUsername } = useAuth();

  const [data, setData] = useState<AccountData>({
    nombreCompleto: "",
    nombreUsuario: username || "",
    email: email || "",
    pin: "",
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
    themePreference: (localStorage.getItem('appfactura_theme') as 'light' | 'dark') || 'light',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const user = await apiClient(`/users/username/${username}`);
        setData((prev) => ({
          ...prev,
          id: user.id,
          nombreUsuario: user.username || "",
          nombreCompleto: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
          email: user.email || "",
          pin: user.pin || "",
          themePreference: (user.themePreference as 'light' | 'dark') || 'light',
        }));
        
        // Sincronizar con el localStorage local de una vez
        if (user.themePreference) {
           localStorage.setItem('appfactura_theme', user.themePreference);
           window.dispatchEvent(new CustomEvent('appfactura:theme-updated', { detail: { theme: user.themePreference } }));
        }
      } catch (err) {
        console.error("Error cargando el perfil", err);
        setError("No se pudo cargar la información del perfil.");
      }
    };

    fetchProfile();
  }, [username]);

  const handleChange = (field: keyof AccountData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
    setShowLogoutModal(false);

    // Aplicación inmediata del tema visualmente, pero se guarda en backend al darle a Guardar
    if (field === 'themePreference') {
      localStorage.setItem('appfactura_theme', value);
      window.dispatchEvent(new CustomEvent('appfactura:theme-updated', { detail: { theme: value } }));
      
      // Guardar instantáneamente en el backend sin requerir darle a Guardar
      if (data.id) {
        apiClient(`/users/${data.id}`, {
          method: "PATCH",
          body: JSON.stringify({ themePreference: value }),
        }).catch(err => console.error("Error guardando tema en background", err));
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    setError("");

    if (!data.id) {
      setError("Falta el ID del usuario. Recarga la página.");
      setLoading(false);
      return;
    }

    if (!data.nombreUsuario || data.nombreUsuario.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      setLoading(false);
      return;
    }

    const validatePassword = (pass: string) => {
      const requirements = [
        { regex: /.{8,}/, msg: "mínimo 8 caracteres" },
        { regex: /[A-Z]/, msg: "al menos una mayúscula" },
        { regex: /[a-z]/, msg: "al menos una minúscula" },
        { regex: /[0-9]/, msg: "al menos un número" },
        { regex: /[@$!%*?&]/, msg: "al menos un carácter especial (@$!%*?&)" },
      ];

      for (const req of requirements) {
        if (!req.regex.test(pass)) return req.msg;
      }
      return null;
    };

    if (data.nuevaPassword) {
      const passwordError = validatePassword(data.nuevaPassword);
      if (passwordError) {
        setError(`La contraseña no es válida: ${passwordError}`);
        setLoading(false);
        return;
      }

      if (data.nuevaPassword !== data.confirmarPassword) {
        setError("Las nuevas contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (!data.passwordActual) {
        setError("Necesita la contraseña actual para definir una nueva");
        setLoading(false);
        return;
      }

      // Validar contraseña actual directamente en el backend
      try {
        const loginResult = await authService.login(username, data.passwordActual);
        if (!loginResult.success) {
          setError("La contraseña actual es incorrecta");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError("Error validando la contraseña actual");
        setLoading(false);
        return;
      }
    }

    if (!data.pin || data.pin.length !== 4 || !/^\d+$/.test(data.pin)) {
      setError("El PIN debe ser un código numérico de exactamente 4 dígitos");
      setLoading(false);
      return;
    }

    try {
      const parts = data.nombreCompleto.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const updatePayload: any = {
        username: data.nombreUsuario.trim(),
        firstName,
        lastName,
        email: data.email,
        pin: data.pin,
        themePreference: data.themePreference,
      };

      const passwordChanged = !!data.nuevaPassword;
      if (passwordChanged) {
        updatePayload.password = data.nuevaPassword;
      }

      await apiClient(`/users/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      });

      if (username !== data.nombreUsuario.trim()) {
        updateUsername(data.nombreUsuario.trim());
      }

      setData((prev) => ({
        ...prev,
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: "",
      }));

      setSuccess("Datos actualizados correctamente");
      if (passwordChanged) {
        setShowLogoutModal(true);
      }
    } catch (err: any) {
      console.error("Error actualizando perfil", err);
      // Prisma P2002 conflict error will be returned as 409 from the backend with the message
      if (err.message && err.message.toLowerCase().includes("existe")) {
         setError("Ese nombre de usuario, PIN o correo ya está en uso por otra cuenta.");
      } else {
         setError(err.message || "Error al actualizar los datos");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    success,
    error,
    showLogoutModal,
    setShowLogoutModal,
    handleChange,
    handleSave,
  };
}
