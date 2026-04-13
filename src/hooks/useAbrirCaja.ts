import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";

export function useAbrirCaja() {
  const navigate = useNavigate();
  const { abrirCaja } = useCaja();
  const [amount, setAmount] = useState("");

  const canSubmit = Number(amount) > 0;

  const handleSubmit = () => {
    console.log("[useAbrirCaja] Ejecutando handleSubmit con monto:", amount);
    abrirCaja(Number(amount));
    console.log("[useAbrirCaja] Navegando a /home...");
    navigate("/home");
  };

  const handleCancel = () => {
    navigate("/home");
  };

  return {
    amount,
    setAmount,
    canSubmit,
    handleSubmit,
    handleCancel,
  };
}
