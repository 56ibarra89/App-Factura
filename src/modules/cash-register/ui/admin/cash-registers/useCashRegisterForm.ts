import { useState } from "react";
import type { FormEvent } from "react";
import type { UserAccount } from "../../../../accounts";
import type {
  CashRegisterConfig,
  CashRegisterType,
} from "../../../model/cash-register.types";

interface CashRegisterFormErrors {
  name?: string;
  amount?: string;
  type?: string;
}

interface UseCashRegisterFormOptions {
  users: UserAccount[];
  onAdd(
    name: string,
    amount: number,
    type?: CashRegisterType,
    userIds?: string[],
    userNames?: string[],
  ): void;
  onUpdate(
    id: string,
    name: string,
    amount: number,
    type?: CashRegisterType,
    userIds?: string[],
    userNames?: string[],
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

export function useCashRegisterForm({
  users,
  onAdd,
  onUpdate,
}: UseCashRegisterFormOptions) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<CashRegisterConfig | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<
    CashRegisterType | ""
  >("");
  const [assignedUserIds, setAssignedUserIds] = useState<
    string[]
  >([]);
  const [errors, setErrors] =
    useState<CashRegisterFormErrors>({});

  const openForCreation = () => {
    setEditing(null);
    setName("");
    setAmount("");
    setType("Principal");
    setAssignedUserIds([]);
    setErrors({});
    setOpen(true);
  };

  const openForEditing = (cashRegister: CashRegisterConfig) => {
    setEditing(cashRegister);
    setName(cashRegister.name);
    setAmount(String(cashRegister.defaultOpeningAmount));
    setType(cashRegister.type || "Principal");
    setAssignedUserIds(
      cashRegister.assignedUserIds ||
        (cashRegister.assignedUserId
          ? [cashRegister.assignedUserId]
          : []),
    );
    setErrors({});
    setOpen(true);
  };

  const close = () => setOpen(false);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: CashRegisterFormErrors = {};
    const parsedAmount = amount.trim()
      ? Number.parseFloat(amount)
      : 0;

    if (!name.trim()) {
      nextErrors.name =
        "El nombre de la caja es obligatorio.";
    }
    if (!type) {
      nextErrors.type =
        "El rol de la caja es obligatorio.";
    }
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      nextErrors.amount =
        "Ingresa un monto válido (puede ser 0 o vacío).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !type) return;

    const userIds =
      assignedUserIds.length > 0
        ? assignedUserIds
        : undefined;
    const userNames = getAssignedUserNames(
      assignedUserIds,
      users,
    );

    if (editing) {
      onUpdate(
        editing.id,
        name.trim(),
        parsedAmount,
        type,
        userIds,
        userNames,
      );
    } else {
      onAdd(
        name.trim(),
        parsedAmount,
        type,
        userIds,
        userNames,
      );
    }
    close();
  };

  return {
    open,
    editing,
    name,
    amount,
    type,
    assignedUserIds,
    errors,
    setName,
    setAmount,
    setType,
    setAssignedUserIds,
    openForCreation,
    openForEditing,
    close,
    save,
  };
}

export type CashRegisterFormController = ReturnType<
  typeof useCashRegisterForm
>;
