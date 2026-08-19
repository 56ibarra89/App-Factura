import type { LogLevel } from "../model/audit.types";

export interface ParsedLogDetails {
  isJson: boolean;
  raw: string;
  summaryText?: string;
  orderInfo?: {
    invoiceNumber?: string;
    issuedNumber?: number;
    orderId?: string;
    finalTotal?: number;
    taxAmount?: number;
    payments?: Array<{ method: string; amount: number }>;
    promotionCode?: string;
    promotionSource?: string;
    resolutionNumber?: string;
  };
  keyValuePairs?: Array<{ key: string; label: string; value: string }>;
}

export interface ActionMetadata {
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  category: string;
  iconName: string;
}

export const ACTION_METADATA_MAP: Record<string, ActionMetadata> = {
  ORDER_FINALIZED: {
    label: "Orden Facturada",
    color: "success",
    category: "Facturación",
    iconName: "ReceiptLong",
  },
  LOGIN_PASSWORD: {
    label: "Inicio de Sesión (Contraseña)",
    color: "info",
    category: "Seguridad",
    iconName: "Login",
  },
  LOGIN_PIN: {
    label: "Inicio de Sesión (PIN)",
    color: "info",
    category: "Seguridad",
    iconName: "LockOpen",
  },
  LOGOUT: {
    label: "Cierre de Sesión",
    color: "default",
    category: "Seguridad",
    iconName: "Logout",
  },
  CONFIG_CHANGE: {
    label: "Cambio de Configuración",
    color: "secondary",
    category: "Configuración",
    iconName: "Settings",
  },
  CREATE_RESERVATION: {
    label: "Reserva Creada",
    color: "primary",
    category: "Mesas",
    iconName: "EventSeat",
  },
  CANCEL_RESERVATION: {
    label: "Reserva Cancelada",
    color: "warning",
    category: "Mesas",
    iconName: "EventBusy",
  },
  PRODUCT_CREATE: {
    label: "Producto Creado",
    color: "primary",
    category: "Catálogo",
    iconName: "AddCircle",
  },
  PRODUCT_UPDATE: {
    label: "Producto Actualizado",
    color: "warning",
    category: "Catálogo",
    iconName: "Edit",
  },
  PRODUCT_DELETE: {
    label: "Producto Eliminado",
    color: "error",
    category: "Catálogo",
    iconName: "Delete",
  },
  CLEAR_HISTORY: {
    label: "Historial Limpiado",
    color: "error",
    category: "Sistema",
    iconName: "CleaningServices",
  },
  USER_CREATE: {
    label: "Usuario Creado",
    color: "primary",
    category: "Usuarios",
    iconName: "PersonAdd",
  },
  USER_UPDATE: {
    label: "Usuario Actualizado",
    color: "info",
    category: "Usuarios",
    iconName: "Person",
  },
  USER_UPDATE_STATUS: {
    label: "Estado de Usuario",
    color: "warning",
    category: "Usuarios",
    iconName: "ManageAccounts",
  },
  USER_DELETE: {
    label: "Usuario Eliminado",
    color: "error",
    category: "Usuarios",
    iconName: "PersonRemove",
  },
};

export function getActionMetadata(action: string): ActionMetadata {
  if (ACTION_METADATA_MAP[action]) {
    return ACTION_METADATA_MAP[action];
  }

  const formattedLabel = action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return {
    label: formattedLabel,
    color: "primary",
    category: "Actividad",
    iconName: "EventNote",
  };
}

export function parseLogDetails(details?: string): ParsedLogDetails {
  if (!details || details.trim() === "") {
    return { isJson: false, raw: "", summaryText: "Sin detalles adicionales." };
  }

  const trimmed = details.trim();
  if (!(trimmed.startsWith("{") && trimmed.endsWith("}"))) {
    return { isJson: false, raw: details, summaryText: details };
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, any>;

    if (parsed.invoiceNumber || parsed.orderId || parsed.finalTotal !== undefined) {
      const payments = Array.isArray(parsed.payments)
        ? parsed.payments.map((p: any) => ({
            method: String(p.method || "PAGO"),
            amount: Number(p.amount || 0),
          }))
        : [];

      const summaryText = `Factura #${parsed.invoiceNumber || "S/N"} para la orden ${parsed.orderId || "N/A"}`;

      return {
        isJson: true,
        raw: details,
        summaryText,
        orderInfo: {
          invoiceNumber: parsed.invoiceNumber,
          issuedNumber: parsed.issuedNumber,
          orderId: parsed.orderId,
          finalTotal: parsed.finalTotal,
          taxAmount: parsed.taxAmount,
          payments,
          promotionCode: parsed.promotionCode,
          promotionSource: parsed.promotionSource,
          resolutionNumber: parsed.resolutionNumber,
        },
      };
    }

    // Genérico JSON: Convertir claves a un formato amigable
    const keyValuePairs = Object.entries(parsed)
      .filter(([_, val]) => val !== undefined && val !== null && val !== "")
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
        return { key, label, value: displayValue };
      });

    return {
      isJson: true,
      raw: details,
      summaryText: keyValuePairs.map((kv) => `${kv.label}: ${kv.value}`).join(" • "),
      keyValuePairs,
    };
  } catch {
    return { isJson: false, raw: details, summaryText: details };
  }
}

