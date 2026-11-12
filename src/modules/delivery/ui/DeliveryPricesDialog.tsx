import React from "react";
import DeliveryZonesConfigModal from "./DeliveryZonesConfigModal";

interface DeliveryPricesDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Adaptador de compatibilidad: Redirige al nuevo modal integral de Zonas y Reglas de Delivery.
 */
export default function DeliveryPricesDialog({
  open,
  onClose,
}: DeliveryPricesDialogProps) {
  return <DeliveryZonesConfigModal open={open} onClose={onClose} />;
}
