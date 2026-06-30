import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logService } from "../../services/logService";
import { Mesa } from "../../types/mesa.types";
import { useTableReservations } from "../useTableReservations";
import { useOrderContext } from "../../context/OrderContext";
import { FloorConfig } from "../useMesasConfig";

interface UseMesaLogicProps {
  floorsConfig: FloorConfig[];
  role: string | null;
  username: string;
  assignedFloorId: number | null;
  openReservation: () => void;
  openTableSelect: (mode: "unir" | "mover") => void;
}

export function useMesaLogic({
  floorsConfig,
  role,
  username,
  assignedFloorId,
  openReservation,
  openTableSelect,
}: UseMesaLogicProps) {
  const navigate = useNavigate();
  const { tableStatusMap, reservationDetails, reserveTable, releaseTable, setTableStatus } =
    useTableReservations();
  const { orders, getOrderByTable, moveOrder, unirMesas, updateOrderStatus, addOrder } = useOrderContext();

  // Filtrar plantas que tengan mesas asignadas y que pertenezcan al mesero (si es mesero)
  const activeFloors = useMemo(() => {
    let base = floorsConfig.filter((f) => f.tableCount > 0);
    if (role === "mesero" && assignedFloorId !== null) {
      base = base.filter((f) => f.id === assignedFloorId);
    }
    return base;
  }, [floorsConfig, role, assignedFloorId]);

  const floors = useMemo(() => 
    activeFloors.length > 0
      ? activeFloors.map((f) => ({ id: f.id, name: f.name }))
      : [], 
  [activeFloors]);

  const [selectedFloor, setSelectedFloor] = useState<number>(activeFloors[0]?.id || 1);
  const [selectedMesaId, setSelectedMesaId] = useState<string | null>(null);

  // Sincronizar el selectedFloor si cambian los activeFloors y el actual ya no es válido
  useEffect(() => {
    if (activeFloors.length > 0 && !activeFloors.find(f => f.id === selectedFloor)) {
      setSelectedFloor(activeFloors[0].id);
    }
  }, [activeFloors, selectedFloor]);

  const activeFloorConfig = useMemo(() => activeFloors.find((f) => f.id === selectedFloor), [activeFloors, selectedFloor]);
  const tableCount = activeFloorConfig ? activeFloorConfig.tableCount : 0;

  const isTableBlocked = useCallback((tableId: string) => {
    return orders.some(o => {
      // Un pedido en blanco no bloquea la mesa, permitiendo liberarla
      if (!o.items || o.items.length === 0) return false;

      return (o.tableId === tableId || o.linkedTables?.includes(tableId)) &&
      o.status !== "cancelled" &&
      (
        o.status !== "paid" || 
        o.items.some(item => item.isSentToKitchen && item.kitchenStatus !== "delivered")
      );
    });
  }, [orders]);

  const mesas: Mesa[] = useMemo(() => {
    return Array.from({ length: tableCount }).map((_, idx) => {
      const tableNum = idx + 1;
      const uniqueId = `F${selectedFloor}-M${tableNum}`;

      const hasBlockingOrder = isTableBlocked(uniqueId);
      const estado = hasBlockingOrder
        ? "ocupado"
        : tableStatusMap[uniqueId] || "disponible";

      return {
        id: uniqueId,
        estado: estado,
        floor: selectedFloor,
        reservationName: reservationDetails[uniqueId]?.nombre,
      };
    });
  }, [tableCount, selectedFloor, isTableBlocked, tableStatusMap, reservationDetails]);

  const selectedMesaStatus = useMemo(() => 
    selectedMesaId ? tableStatusMap[selectedMesaId] || "disponible" : null,
  [selectedMesaId, tableStatusMap]);

  const isReserved = selectedMesaStatus === "reservado";
  const activeOrder = useMemo(() => selectedMesaId ? getOrderByTable(selectedMesaId) : null, [selectedMesaId, getOrderByTable]);

  const handleReservar = useCallback(() => {
    if (!selectedMesaId) return;

    if (getOrderByTable(selectedMesaId)) {
      console.warn("No se puede reservar una mesa con pedido activo.");
      return;
    }

    if (isReserved) {
      releaseTable(selectedMesaId);
      logService.log(username, role, "CANCEL_RESERVATION", `Reserva cancelada para Mesa ${selectedMesaId.split("-M")[1]}`);
    } else {
      openReservation();
    }
  }, [selectedMesaId, getOrderByTable, isReserved, releaseTable, username, role, openReservation]);

  const handleConfirmReservation = useCallback((nombre: string, monto: number, reservationTime: string, expirationTime: string, onDialogClose: () => void) => {
    if (!selectedMesaId) return;

    reserveTable(selectedMesaId, { nombre, monto, reservationTime, expirationTime });
    logService.log(username, role, "CREATE_RESERVATION", `Nueva reserva para ${nombre} en Mesa ${selectedMesaId.split("-M")[1]} por monto: ${monto}`);
    onDialogClose();
  }, [selectedMesaId, reserveTable, username, role]);

  const handleEditOrder = useCallback(() => {
    if (!selectedMesaId) return;
    if (isReserved) releaseTable(selectedMesaId);
    
    if (!tableStatusMap[selectedMesaId] || tableStatusMap[selectedMesaId] === "disponible") {
      setTableStatus(selectedMesaId, "ocupado");
    }

    navigate(`/facturacion?tableId=${selectedMesaId}`);
  }, [selectedMesaId, isReserved, releaseTable, tableStatusMap, setTableStatus, navigate]);

  const clearTableStatus = useCallback((tablesToClear: string[]) => {
    tablesToClear.forEach(tId => {
      if (tableStatusMap[tId] === "ocupado") {
        setTableStatus(tId, "disponible");
      }
    });
  }, [tableStatusMap, setTableStatus]);

  const handleToggleOccupancy = useCallback(() => {
    if (!selectedMesaId) return;

    if (isTableBlocked(selectedMesaId)) {
      alert("No se puede liberar la mesa porque hay cuentas pendientes o pedidos sin entregar.");
      return;
    }

    if (selectedMesaStatus === "ocupado" || selectedMesaStatus === "reservado") {
      const activeOrder = getOrderByTable(selectedMesaId);
      if (activeOrder && (!activeOrder.items || activeOrder.items.length === 0)) {
        // Cancel the dummy order if the table is released without adding items
        // @ts-expect-error - Expected 5 args, got 2
        updateOrderStatus(activeOrder.id, "CANCELLED");
      }
      
      if (selectedMesaStatus === "reservado") {
        releaseTable(selectedMesaId);
      } else {
        setTableStatus(selectedMesaId, "disponible");
      }
    } else {
      setTableStatus(selectedMesaId, "ocupado");
      addOrder([], 0, undefined, "local", undefined, selectedMesaId);
    }
  }, [selectedMesaId, selectedMesaStatus, isTableBlocked, setTableStatus, releaseTable, getOrderByTable, updateOrderStatus, addOrder]);

  const handleUnirMesas = useCallback(() => {
    if (!selectedMesaId) return;
    openTableSelect("unir");
  }, [selectedMesaId, openTableSelect]);

  const handleMoverPedido = useCallback(() => {
    if (!selectedMesaId) return;
    openTableSelect("mover");
  }, [selectedMesaId, openTableSelect]);

  const handleTableSelectConfirm = useCallback((targetTableId: string | string[], mode: "unir" | "mover", onDialogClose: () => void) => {
    if (!selectedMesaId) return;
    if (mode === "unir") {
      unirMesas(selectedMesaId, targetTableId);
      const newTables = Array.isArray(targetTableId) ? targetTableId : [targetTableId];
      newTables.forEach(tId => {
        if (tableStatusMap[tId] !== "ocupado") {
          setTableStatus(tId, "ocupado");
        }
      });
    } else if (mode === "mover") {
      const order = activeOrder;
      const sourceTables = [selectedMesaId];
      if (order?.linkedTables) sourceTables.push(...order.linkedTables);

      let finalTarget = targetTableId;
      if (Array.isArray(targetTableId)) {
        const maxAllowed = sourceTables.length;
        if (targetTableId.length > maxAllowed) {
          finalTarget = targetTableId.slice(0, maxAllowed);
        }
      }

      moveOrder(selectedMesaId, finalTarget);

      const newTables = Array.isArray(finalTarget) ? finalTarget : [finalTarget];
      const tablesToFree = sourceTables.filter(t => !newTables.includes(t));
      clearTableStatus(tablesToFree);

      newTables.forEach(tId => {
        if (tableStatusMap[tId] !== "ocupado") {
          setTableStatus(tId, "ocupado");
        }
      });

      const nextMesaId = Array.isArray(finalTarget) ? finalTarget[0] : finalTarget;
      setSelectedMesaId(nextMesaId);
    }
    onDialogClose();
  }, [selectedMesaId, unirMesas, moveOrder, activeOrder, clearTableStatus, tableStatusMap, setTableStatus]);

  const getAvailableTables = useCallback(() => {
    return mesas
      .filter((m) => m.estado === "disponible" && m.id !== selectedMesaId)
      .map((m) => ({
        id: m.id,
        label: `Planta ${m.floor} - Mesa ${m.id.split("-M")[1]}`,
      }));
  }, [mesas, selectedMesaId]);

  const canModifyOrder = useMemo(() => {
    if (!activeOrder) return true;
    if (role === "admin" || role === "cajero") return true;
    return activeOrder.cashierName === username;
  }, [activeOrder, role, username]);

  return {
    activeFloors,
    floors,
    selectedFloor,
    setSelectedFloor,
    selectedMesaId,
    setSelectedMesaId,
    mesas,
    selectedMesaStatus,
    isReserved,
    activeOrder,
    canModifyOrder,
    isTableBlocked,
    handleReservar,
    handleConfirmReservation,
    handleEditOrder,
    handleToggleOccupancy,
    handleUnirMesas,
    handleMoverPedido,
    handleTableSelectConfirm,
    getAvailableTables,
    clearTableStatus,
  };
}
