import type { Shift } from "./cash-register.types";

export const ROLE_COLORS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  admin: {
    bg: "rgba(156, 39, 176, 0.12)",
    color: "#ab47bc",
    border: "#ab47bc",
  },
  cajero: {
    bg: "rgba(25, 118, 210, 0.12)",
    color: "#1976d2",
    border: "#1976d2",
  },
  cajero_principal: {
    bg: "rgba(0, 150, 136, 0.12)",
    color: "#00897b",
    border: "#00897b",
  },
  mesero: {
    bg: "rgba(46, 125, 50, 0.12)",
    color: "#2e7d32",
    border: "#2e7d32",
  },
  cocinero: {
    bg: "rgba(237, 108, 2, 0.12)",
    color: "#ed6c02",
    border: "#ed6c02",
  },
  motorizado: {
    bg: "rgba(2, 136, 209, 0.12)",
    color: "#0288d1",
    border: "#0288d1",
  },
  despachador: {
    bg: "rgba(211, 47, 47, 0.12)",
    color: "#d32f2f",
    border: "#d32f2f",
  },
};

export interface ShiftDurationInfo {
  durationText: string;
  hours: number;
  isExcessive: boolean;
  isUltraShort: boolean;
  isOpenProlonged: boolean;
}

export function calculateDuration(
  start: Date | string,
  end?: Date | string,
): ShiftDurationInfo {
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMs = Math.max(0, endTime - startTime);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const durationText = `${hours}h ${minutes}m`;
  const isExcessive = hours >= 16;
  const isUltraShort = Boolean(end) && totalMinutes < 5;
  const isOpenProlonged = !end && hours >= 12;

  return { durationText, hours, isExcessive, isUltraShort, isOpenProlonged };
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getShiftDifference(shift: Shift): {
  totalDiff: number;
  cashDiff: number;
  cardDiff: number;
  appDiff: number;
  isBalanced: boolean;
} {
  const cashDiff = shift.cashDifference ?? 0;
  const cardDiff = shift.cardDifference ?? 0;
  const appDiff = shift.appDifference ?? 0;
  const totalDiff = shift.totalDifference ?? shift.cashDifference ?? 0;
  const isBalanced = Math.abs(totalDiff) < 0.01;

  return { totalDiff, cashDiff, cardDiff, appDiff, isBalanced };
}
