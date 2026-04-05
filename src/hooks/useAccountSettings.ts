import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export interface AccountData {
  nombreCompleto: string;
  nombreUsuario: string;
  pin: string;
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export function useAccountSettings() {
  const { username } = useAuth();
  
  const [data, setData] = useState<AccountData>({
    nombreCompleto: "",
    nombreUsuario: username || "",
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
    const savedData = localStorage.getItem(`account_data_${username}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(prev => ({
          ...prev,
          nombreCompleto: parsed.nombreCompleto || "",
          pin: parsed.pin || "",
        }));
      } catch (e) {
        console.error("Error cargando datos de cuenta", e);
      }
    } else {
      // Valores por defecto
      setData(prev => ({
        ...prev,
        nombreCompleto: username === "admin" ? "Administrador Principal" : "Usuario Creado",
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
    setError("");
    setSuccess("");

    // Validaciones
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
      password: data.nuevaPassword || "123456" // Mantener la anterior en la vida real
    };
    
    localStorage.setItem(`account_data_${username}`, JSON.stringify(toSave));

    // Limpiar campos de contraseña
    setData(prev => ({
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
