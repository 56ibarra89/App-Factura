import { useEffect, useMemo, useState } from "react";
import { useAccountManager } from "./useAccountManager";
import type { DeliveryStat } from "../types/delivery";

export interface ScheduleToast {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export function useAdminSchedules() {
  const {
    users,
    loading,
    saveUser,
    addExtraDay,
    removeExtraDay,
    fetchDeliveryStats,
  } = useAccountManager();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<DeliveryStat[]>([]);
  const [currentWorkDays, setCurrentWorkDays] = useState<string[]>([]);
  const [toast, setToast] = useState<ScheduleToast>({
    open: false,
    message: "",
    severity: "success",
  });

  const employees = useMemo(
    () => users.filter((user) => user.role !== "admin"),
    [users],
  );
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? null;

  useEffect(() => {
    void fetchDeliveryStats().then((data) => {
      if (Array.isArray(data)) setStats(data);
    });
  }, [fetchDeliveryStats]);

  useEffect(() => {
    setCurrentWorkDays(selectedUser?.workDays ?? []);
  }, [selectedUser]);

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);
  const hasExtraDayToday =
    selectedUser?.extraDays?.some((day) => day.date.startsWith(today)) ??
    false;
  const pastExtraDays = (selectedUser?.extraDays ?? [])
    .filter(
      (day) =>
        !day.date.startsWith(today) && day.date.startsWith(currentMonth),
    )
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime(),
    );

  const toggleWorkDay = (day: string) => {
    setCurrentWorkDays((previous) =>
      previous.includes(day)
        ? previous.filter((current) => current !== day)
        : [...previous, day],
    );
  };

  const saveSchedule = async () => {
    if (!selectedUser) return;

    try {
      const savedUser = await saveUser({
        ...selectedUser,
        workDays: currentWorkDays,
      });
      if (!savedUser) {
        throw new Error("No fue posible guardar el horario.");
      }
      setToast({
        open: true,
        message: `Horario guardado para ${selectedUser.firstName} ${selectedUser.lastName}.`,
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        message: "Ocurrió un error al guardar el horario.",
        severity: "error",
      });
    }
  };

  const toggleExtraDay = async () => {
    if (!selectedUser) return;

    try {
      if (hasExtraDayToday) {
        await removeExtraDay(selectedUser.id, today);
      } else {
        await addExtraDay(selectedUser.id, today);
      }
      setToast({
        open: true,
        message: hasExtraDayToday
          ? "Día extra removido."
          : "Día extra añadido para hoy.",
        severity: "success",
      });
    } catch {
      setToast({
        open: true,
        message: "Error al actualizar día extra.",
        severity: "error",
      });
    }
  };

  const closeToast = () => {
    setToast((previous) => ({ ...previous, open: false }));
  };

  return {
    employees,
    loading,
    selectedUser,
    selectedUserId,
    stats,
    currentWorkDays,
    hasExtraDayToday,
    pastExtraDays,
    toast,
    selectUser: setSelectedUserId,
    toggleWorkDay,
    saveSchedule,
    toggleExtraDay,
    closeToast,
  };
}
