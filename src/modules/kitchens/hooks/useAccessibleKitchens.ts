import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth";
import {
  kitchensGateway,
  type CookKitchenAssignment,
  type KitchensGateway,
} from "../api/kitchensGateway";
import { useKitchens } from "./useKitchens";

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

const WEEK_DAYS: readonly WeekDay[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function getWeekDay(date: Date = new Date()): WeekDay {
  return WEEK_DAYS[date.getDay()];
}

export function useAccessibleKitchens(
  gateway: KitchensGateway = kitchensGateway,
) {
  const { role } = useAuth();
  const kitchenState = useKitchens(gateway);
  const isCook = role === "cocinero";
  const [assignments, setAssignments] = useState<CookKitchenAssignment[]>([]);
  const [isAssignmentLoading, setIsAssignmentLoading] = useState(isCook);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isCook) {
      setAssignments([]);
      setAssignmentError(null);
      setIsAssignmentLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsAssignmentLoading(true);
    setAssignmentError(null);
    gateway
      .listMyAssignments()
      .then((data) => {
        if (isMounted) setAssignments(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        console.error("Error fetching current cook assignments:", error);
        if (isMounted) {
          setAssignments([]);
          setAssignmentError("No se pudo consultar tu cocina asignada.");
        }
      })
      .finally(() => {
        if (isMounted) setIsAssignmentLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [gateway, isCook]);

  const todayAssignment = useMemo(() => {
    if (!isCook) return undefined;
    const currentDay = getWeekDay();
    return assignments.find(
      (assignment) => assignment.dayOfWeek === currentDay,
    );
  }, [assignments, isCook]);

  const kitchens = useMemo(() => {
    if (!isCook) return kitchenState.kitchens;
    if (!todayAssignment) return [];
    return kitchenState.kitchens.filter(
      (kitchen) => kitchen.id === todayAssignment.kitchenId,
    );
  }, [isCook, kitchenState.kitchens, todayAssignment]);

  return {
    ...kitchenState,
    kitchens,
    isLoading: kitchenState.isLoading || isAssignmentLoading,
    isCook,
    assignedKitchenId: todayAssignment?.kitchenId ?? null,
    hasTodayAssignment: !isCook || Boolean(todayAssignment),
    assignmentError,
  };
}
