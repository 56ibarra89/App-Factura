import { useState, useEffect } from "react";
import { useAuth } from "../../auth";
import { getThemePreference, setThemePreference, type ThemePreference } from "../../../shared/preferences";
import { validatePasswordStrength } from "../../../shared/validation";
import {
  usersGateway,
  type UserMutationPayload,
  type UserProfileGateway,
} from "../api/usersGateway";
import type { AccountData } from "../model/account.types";

export function useAccountSettings(
  gateway: UserProfileGateway = usersGateway,
) {
  const { username, email, updateUsername, logout } = useAuth();

  const [data, setData] = useState<AccountData>({
    nombreCompleto: "",
    nombreUsuario: username || "",
    email: email || "",
    pin: "",
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
    themePreference: getThemePreference(),
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const user = await gateway.findByUsername(username);
        setData((prev) => ({
          ...prev,
          id: user.id,
          nombreUsuario: user.username || "",
          nombreCompleto: [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
          email: user.email || "",
          pin: user.pin || "",
          themePreference: (user.themePreference as 'light' | 'dark') || 'light',
        }));

          if (user.themePreference) {
            setThemePreference(user.themePreference as ThemePreference);
        }
      } catch (err) {
        console.error("Error cargando el perfil", err);
        setError("No se pudo cargar la información del perfil.");
      }
    };

    fetchProfile();
  }, [gateway, username]);

  const handleChange = (field: keyof AccountData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
    setShowLogoutModal(false);

    if (field === 'themePreference') {
      setThemePreference(value as ThemePreference);

      if (data.id) {
        gateway
          .updateOwn({ themePreference: value as ThemePreference })
          .catch((err) =>
            console.error("Error guardando tema en background", err),
          );
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

    if (data.nuevaPassword) {
      const passwordError = validatePasswordStrength(data.nuevaPassword);
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

    }

    if (data.pin) {
      if (!/^\d{6}$/.test(data.pin)) {
        setError("El nuevo PIN debe ser un código numérico de exactamente 6 dígitos");
        setLoading(false);
        return;
      }
      if (!data.passwordActual) {
        setError("Necesita la contraseña actual para cambiar el PIN");
        setLoading(false);
        return;
      }
    }

    try {
      const parts = data.nombreCompleto.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const updatePayload: UserMutationPayload = {
        username: data.nombreUsuario.trim(),
        firstName,
        lastName,
        ...(data.email.trim() ? { email: data.email.trim() } : {}),
        themePreference: data.themePreference,
      };

      if (data.pin) {
        updatePayload.pin = data.pin;
      }

      const passwordChanged = !!data.nuevaPassword;
      if (passwordChanged) {
        updatePayload.password = data.nuevaPassword;
      }

      if (data.pin || passwordChanged) {
        updatePayload.currentPassword = data.passwordActual;
      }

      await gateway.updateOwn(updatePayload);

      if (username !== data.nombreUsuario.trim()) {
        updateUsername(data.nombreUsuario.trim());
      }

      setData((prev) => ({
        ...prev,
        pin: "",
        passwordActual: "",
        nuevaPassword: "",
        confirmarPassword: "",
      }));

      setSuccess("Datos actualizados correctamente");
      if (passwordChanged || Boolean(data.pin)) {
        await logout();
      }
    } catch (err: unknown) {
      console.error("Error actualizando perfil", err);
      // Prisma P2002 conflict error will be returned as 409 from the backend with the message
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("existe")) {
         setError("Ese nombre de usuario, PIN o correo ya está en uso por otra cuenta.");
      } else {
         setError(message || "Error al actualizar los datos");
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
