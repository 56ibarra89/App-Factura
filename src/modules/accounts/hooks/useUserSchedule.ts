import { useCallback } from "react";
import {
  usersGateway,
  type UserScheduleGateway,
} from "../api/usersGateway";
import { useUserDirectoryStore } from "../model/UserDirectoryContext";

export function useUserSchedule(
  gateway: UserScheduleGateway = usersGateway,
) {
  const { refreshUsers } = useUserDirectoryStore();

  const addExtraDay = useCallback(
    async (
      userId: string,
      date: string,
      notes?: string,
    ) => {
      await gateway.addExtraDay(userId, date, notes);
      await refreshUsers();
    },
    [gateway, refreshUsers],
  );

  const removeExtraDay = useCallback(
    async (userId: string, date: string) => {
      await gateway.removeExtraDay(userId, date);
      await refreshUsers();
    },
    [gateway, refreshUsers],
  );

  return {
    addExtraDay,
    removeExtraDay,
  };
}
