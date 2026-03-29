import { useOrderContext } from "../context/OrderContext";
import { useMemo } from "react";

export const useOrderManagement = () => {
  const { orders, updateOrderStatus, removeOrder, clearHistory } = useOrderContext();

  const activeOrders = useMemo(() => 
    orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'),
    [orders]
  );

  const finishedOrders = useMemo(() => 
    orders.filter(o => o.status === 'delivered' || o.status === 'cancelled'),
    [orders]
  );

  return {
    activeOrders,
    finishedOrders,
    updateOrderStatus,
    removeOrder,
    clearHistory
  };
};
