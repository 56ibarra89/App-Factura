import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading, error, login, clearError, loginLockoutTime } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setCredentials((prev) => ({ ...prev, username: savedUser }));
      setRemember(true);
    }

    if (isLoggedIn) {
      navigate("/home");
    }
  }, [navigate, isLoggedIn]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      return;
    }

    const success = await login(credentials.username, credentials.password, remember);
    if (success) {
      navigate("/home");
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
    loginLockoutTime,
  };
};
