import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useLoginPin = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading, error, loginWithPin, clearError } = useAuth();

  const [pin, setPin] = useState<string>("");
  const MAX_PIN_LENGTH = 4;

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [navigate, isLoggedIn]);

  const handlePinSubmit = useCallback(
    async (enteredPin: string) => {
      const success = await loginWithPin(enteredPin);
      if (!success) {
        setPin("");
      }
    },
    [loginWithPin]
  );

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

  return {
    pin,
    loading,
    error,
    appendDigit,
    deleteDigit,
    clearError,
    MAX_PIN_LENGTH,
  };
};
