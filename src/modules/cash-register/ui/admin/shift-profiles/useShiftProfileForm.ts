import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { UserAccount } from "../../../../accounts";
import type { ShiftProfileConfig } from "../../../model/cash-register.types";

interface ShiftProfileFormErrors {
  name?: string;
  time?: string;
}

interface UseShiftProfileFormOptions {
  users: UserAccount[];
  onAdd(
    name: string,
    startTime: string,
    endTime: string,
    description?: string,
    assignedRole?: string,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
    daysOfWeek?: number[],
  ): void;
  onUpdate(
    id: string,
    name: string,
    startTime: string,
    endTime: string,
    description?: string,
    assignedRole?: string,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
    daysOfWeek?: number[],
  ): void;
}

function getAssignedUserNames(
  userIds: string[],
  users: UserAccount[],
): string[] | undefined {
  if (userIds.length === 0) return undefined;
  return userIds
    .map((id) => {
      const user = users.find((item) => item.id === id);
      return user
        ? `${user.firstName} ${user.lastName}`.trim()
        : "";
    })
    .filter(Boolean);
}

export function useShiftProfileForm({
  users,
  onAdd,
  onUpdate,
}: UseShiftProfileFormOptions) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<ShiftProfileConfig | null>(null);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [description, setDescription] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState<
    string[]
  >([]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    [],
  );
  const [errors, setErrors] =
    useState<ShiftProfileFormErrors>({});

  const availableUsers = useMemo(
    () =>
      assignedRole
        ? users.filter(
            (user) => user.role === assignedRole,
          )
        : [],
    [assignedRole, users],
  );

  const openForCreation = () => {
    setEditing(null);
    setName("");
    setStartTime("08:00");
    setEndTime("16:00");
    setDescription("");
    setAssignedRole("");
    setAssignedUserIds([]);
    setDaysOfWeek([]);
    setErrors({});
    setOpen(true);
  };

  const openForEditing = (shift: ShiftProfileConfig) => {
    setEditing(shift);
    setName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setDescription(shift.description || "");
    setAssignedRole(shift.assignedRole || "");
    setAssignedUserIds(shift.assignedUserIds || []);
    setDaysOfWeek(shift.daysOfWeek || []);
    setErrors({});
    setOpen(true);
  };

  const close = () => setOpen(false);

  const changeAssignedRole = (role: string) => {
    setAssignedRole(role);
    setAssignedUserIds([]);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: ShiftProfileFormErrors = {};
    if (!name.trim()) {
      nextErrors.name =
        "El nombre del turno es obligatorio.";
    }
    if (!startTime || !endTime) {
      nextErrors.time =
        "Las horas de inicio y fin son obligatorias.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const userIds =
      assignedUserIds.length > 0
        ? assignedUserIds
        : undefined;
    const userNames = getAssignedUserNames(
      assignedUserIds,
      users,
    );
    const selectedDays =
      daysOfWeek.length > 0 ? daysOfWeek : undefined;
    const role = assignedRole || undefined;

    if (editing) {
      onUpdate(
        editing.id,
        name.trim(),
        startTime,
        endTime,
        description.trim(),
        role,
        userIds,
        userNames,
        selectedDays,
      );
    } else {
      onAdd(
        name.trim(),
        startTime,
        endTime,
        description.trim(),
        role,
        userIds,
        userNames,
        selectedDays,
      );
    }
    close();
  };

  return {
    open,
    editing,
    name,
    startTime,
    endTime,
    description,
    assignedRole,
    assignedUserIds,
    daysOfWeek,
    errors,
    availableUsers,
    setName,
    setStartTime,
    setEndTime,
    setDescription,
    setAssignedUserIds,
    setDaysOfWeek,
    changeAssignedRole,
    openForCreation,
    openForEditing,
    close,
    save,
  };
}

export type ShiftProfileFormController = ReturnType<
  typeof useShiftProfileForm
>;
