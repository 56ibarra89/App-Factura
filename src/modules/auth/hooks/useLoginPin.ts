import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../model/AuthContext";

const MAX_PIN_LENGTH = 4;

export const useLoginPin = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading, error, loginWithPin, clearError, lockoutTime } = useAuth();

  const [pin, setPin] = useState<string>("");
  const submittedPinRef = useRef<string | null>(null);
  const pinEntryDisabled = loading || lockoutTime > 0;

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
    [loginWithPin],
  );

  useEffect(() => {
    if (pin.length < MAX_PIN_LENGTH) {
      submittedPinRef.current = null;
      return;
    }
    if (
      pinEntryDisabled ||
      submittedPinRef.current === pin
    ) {
      return;
    }

    submittedPinRef.current = pin;
    void handlePinSubmit(pin);
  }, [handlePinSubmit, pin, pinEntryDisabled]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (pinEntryDisabled || !/^\d$/.test(digit)) return;
      setPin((current) =>
        current.length < MAX_PIN_LENGTH
          ? current + digit
          : current,
      );
    },
    [pinEntryDisabled],
  );

  const deleteDigit = useCallback(() => {
    if (pinEntryDisabled) return;
    setPin((current) => current.slice(0, -1));
  }, [pinEntryDisabled]);

  return {
    pin,
    loading,
    error,
    appendDigit,
    deleteDigit,
    clearError,
    MAX_PIN_LENGTH,
    lockoutTime,
    pinEntryDisabled,
  };
};
