import React from "react";
import Grid from "@mui/material/Grid";
import { Order, OrderStatus } from "../model/order.types";
import OrderCard from "./OrderCard";
import type { Kitchen } from "../../kitchens";

interface OrderGridProps {
  orders: Order[];
  selectedKitchenId?: string;
  kitchens: Kitchen[];
  resolveTableName?: (tableId: string) => string;
  onUpdateStatus: (id: string, status: OrderStatus, cancelReason?: string, adminPin?: string, sentAt?: number, kitchenId?: string, itemId?: number | string) => void;
  onDelete: (id: string) => void;
}

const OrderGrid: React.FC<OrderGridProps> = ({ orders, selectedKitchenId, kitchens, resolveTableName, onUpdateStatus, onDelete }) => {
  return (
    <Grid container spacing={3}>
      {orders.map((order) => {
        const filteredItems = selectedKitchenId
          ? order.items.filter(item => item.kitchenId === selectedKitchenId)
          : order.items;

        if (filteredItems.length === 0) return null;

        const ticketKey = `${order.id}-${filteredItems[0]?.kitchenId || 'all'}-${filteredItems[0]?.sentAt || 0}`;

        return (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={ticketKey}>
            <OrderCard 
              order={order} 
              filteredItems={filteredItems}
              kitchens={kitchens}
              resolveTableName={resolveTableName}
              onUpdateStatus={onUpdateStatus} 
              onDelete={onDelete}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default OrderGrid;
