import {
  useOrderCommands,
  useOrderQueries,
} from "../../orders";
import type { FloorConfig } from "../model/table.types";
import type { TableSelectMode } from "../model/table.types";
import { useTableReservations } from "./useTableReservations";
import { useMesaAvailability } from "./useMesaAvailability";
import { useMesaOrderActions } from "./useMesaOrderActions";
import { useMesaReservationActions } from "./useMesaReservationActions";
import { useMesaSelection } from "./useMesaSelection";
import { useMesaTransferActions } from "./useMesaTransferActions";

interface UseMesaLogicProps {
  floorsConfig: FloorConfig[];
  role: string | null;
  username: string;
  assignedFloorId: number | null;
  openReservation(): void;
  openTableSelect(mode: TableSelectMode): void;
}

export function useMesaLogic({
  floorsConfig,
  role,
  username,
  assignedFloorId,
  openReservation,
  openTableSelect,
}: UseMesaLogicProps) {
  const reservations = useTableReservations();
  const { orders, getOrderByTable } = useOrderQueries();
  const {
    moveOrder,
    unirMesas,
    updateOrderStatus,
    addOrder,
  } = useOrderCommands();
  const selection = useMesaSelection({
    floorsConfig,
    role,
    assignedFloorId,
  });
  const availability = useMesaAvailability({
    tableCount: selection.tableCount,
    selectedFloor: selection.selectedFloor,
    selectedMesaId: selection.selectedMesaId,
    orders,
    getOrderByTable,
    tableStatusMap: reservations.tableStatusMap,
    reservationDetails:
      reservations.reservationDetails,
    role,
    username,
  });
  const reservationActions =
    useMesaReservationActions({
      selectedMesaId: selection.selectedMesaId,
      isReserved: availability.isReserved,
      username,
      role,
      getOrderByTable,
      reserveTable: reservations.reserveTable,
      releaseTable: reservations.releaseTable,
      openReservation,
    });
  const orderActions = useMesaOrderActions({
    selectedMesaId: selection.selectedMesaId,
    selectedMesaStatus:
      availability.selectedMesaStatus,
    isReserved: availability.isReserved,
    tableStatusMap: reservations.tableStatusMap,
    isTableBlocked: availability.isTableBlocked,
    getOrderByTable,
    setTableStatus: reservations.setTableStatus,
    releaseTable: reservations.releaseTable,
    updateOrderStatus,
    addOrder,
  });
  const transferActions = useMesaTransferActions({
    selectedMesaId: selection.selectedMesaId,
    setSelectedMesaId: selection.setSelectedMesaId,
    activeOrder: availability.activeOrder,
    mesas: availability.mesas,
    tableStatusMap: reservations.tableStatusMap,
    setTableStatus: reservations.setTableStatus,
    moveOrder,
    unirMesas,
    openTableSelect,
  });

  return {
    ...selection,
    ...availability,
    ...reservationActions,
    ...orderActions,
    ...transferActions,
  };
}
