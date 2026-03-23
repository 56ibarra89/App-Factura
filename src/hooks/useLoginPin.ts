import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fakePinAuth } from "../services/authService";

export const useLoginPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_PIN_LENGTH = 4;

  useEffect(() => {
    const isLogged = sessionStorage.getItem("loggedIn");
    if (isLogged) {
      navigate("/home");
    }
  }, [navigate]);

  const handlePinSubmit = useCallback(async (enteredPin: string) => {
    setLoading(true);
    setError("");
    
    const username = await fakePinAuth(enteredPin);
    setLoading(false);

    if (username) {
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("username", username);
      navigate("/home");
    } else {
      setError("PIN incorrecto");
      setPin(""); // clear PIN on error
    }
  }, [navigate]);

  useEffect(() => {
    if (pin.length === MAX_PIN_LENGTH) {
      handlePinSubmit(pin);
    }
  }, [pin, handlePinSubmit]);

  const appendDigit = (digit: string) => {
    if (pin.length < MAX_PIN_LENGTH) {
      setPin((prev) => prev + digit);
    }
  };

  const deleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const clearError = () => setError("");

  return {
    pin,
    loading,
    error,
    appendDigit,
    deleteDigit,
    clearError,
    MAX_PIN_LENGTH
  };
};
