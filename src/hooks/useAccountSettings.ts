import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { localStore, setJson, tryGetJson } from "../services/storage/storage";

export interface AccountData {
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  pin: string;
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export function useAccountSettings() {
  const { username, email } = useAuth();

  const [data, setData] = useState<AccountData>({
    nombreCompleto: "",
    nombreUsuario: username || "",
    email: email || "",
    pin: "",
    passwordActual: "",
    nuevaPassword: "",
    confirmarPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Simular carga de datos iniciales
  useEffect(() => {
    const storageKey = `account_data_${username}`;
    const parsed = tryGetJson<{ nombreCompleto?: string; pin?: string }>(
      localStore,
      storageKey,
    );
    if (parsed) {
      setData((prev) => ({
        ...prev,
        nombreCompleto: parsed.nombreCompleto || "",
        pin: parsed.pin || "",
      }));
    } else {
      // Valores por defecto
      setData((prev) => ({
        ...prev,
        nombreCompleto:
          username === "admin" ? "Administrador Principal" : "Usuario Creado",
        pin: username === "admin" ? "1234" : "0000",
      }));
    }
  }, [username]);

  const handleChange = (field: keyof AccountData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");

    // Validaciones de Complejidad de Contraseña
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

    // Validaciones
    if (data.nuevaPassword) {
      const passwordError = validatePassword(data.nuevaPassword);
      if (passwordError) {
        setError(`La contraseña no es válida: ${passwordError}`);
        setLoading(false);
        return;
      }
    }

    if (data.nuevaPassword && data.nuevaPassword !== data.confirmarPassword) {
      setError("Las nuevas contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (data.nuevaPassword && !data.passwordActual) {
      setError("Necesita la contraseña actual para definir una nueva");
      setLoading(false);
      return;
    }

    if (data.pin && data.pin.length < 4) {
      setError("El PIN debe tener al menos 4 dígitos");
      setLoading(false);
      return;
    }

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Guardar en localStorage (MOCK)
    const toSave = {
      nombreCompleto: data.nombreCompleto,
      pin: data.pin,
      password: data.nuevaPassword || "123456", // Mantener la anterior en la vida real
    };

    setJson(localStore, `account_data_${username}`, toSave);

    // Limpiar campos de contraseña
    setData((prev) => ({
      ...prev,
      passwordActual: "",
      nuevaPassword: "",
      confirmarPassword: "",
    }));

    setSuccess("Datos actualizados correctamente");
    setLoading(false);
  };

  return {
    data,
    loading,
    success,
    error,
    handleChange,
    handleSave,
  };
}
