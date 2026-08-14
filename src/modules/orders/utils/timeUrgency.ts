export type UrgencyLevel = "normal" | "warning" | "critical";

export interface UrgencyInfo {
  minutes: number;
  level: UrgencyLevel;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  isPulsing: boolean;
  label: string;
}

/**
 * Calcula el tiempo transcurrido desde la creación de la orden/ticket
 * y retorna la información visual del semáforo de urgencia.
 */
export function getTicketUrgency(
  timestamp: string | number | Date,
  warningThresholdMinutes = 10,
  criticalThresholdMinutes = 15
): UrgencyInfo {
  const timeMs = new Date(timestamp).getTime();
  const nowMs = Date.now();
  const elapsedMs = Math.max(0, nowMs - timeMs);
  const minutes = Math.floor(elapsedMs / 60000);

  if (minutes >= criticalThresholdMinutes) {
    return {
      minutes,
      level: "critical",
      color: "#d32f2f",
      badgeBg: "rgba(211, 47, 47, 0.2)",
      badgeBorder: "#d32f2f",
      textColor: "#ff8a80",
      isPulsing: true,
      label: `${minutes} min - ¡CRÍTICO!`,
    };
  }

  if (minutes >= warningThresholdMinutes) {
    return {
      minutes,
      level: "warning",
      color: "#ed6c02",
      badgeBg: "rgba(237, 108, 2, 0.2)",
      badgeBorder: "#ed6c02",
      textColor: "#ffb74d",
      isPulsing: false,
      label: `${minutes} min - Atención`,
    };
  }

  return {
    minutes,
    level: "normal",
    color: "#2e7d32",
    badgeBg: "rgba(46, 125, 50, 0.2)",
    badgeBorder: "#2e7d32",
    textColor: "#81c784",
    isPulsing: false,
    label: `${minutes} min`,
  };
}
