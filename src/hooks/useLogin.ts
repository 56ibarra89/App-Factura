import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fakeAuth } from "../services/authService";

export const useLogin = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setCredentials((prev) => ({ ...prev, username: savedUser }));
      setRemember(true);
    }

    const isLogged = sessionStorage.getItem("loggedIn");
    if (isLogged) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const clearError = () => {
    setError("");
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    const isValid = await fakeAuth(credentials.username, credentials.password);
    setLoading(false);

    if (isValid) {
      if (remember) {
        localStorage.setItem("rememberedUser", credentials.username);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("username", credentials.username);
      navigate("/home");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return {
    credentials,
    showPassword,
    remember,
    error,
    loading,
    handleChange,
    handleLogin,
    setRemember,
    togglePasswordVisibility,
    clearError,
  };
};
