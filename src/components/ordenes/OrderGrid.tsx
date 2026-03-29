import React from "react";
import Grid from "@mui/material/Grid";
import { Order, OrderStatus } from "../../types/order.types";
import OrderCard from "./OrderCard";

interface OrderGridProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
}

const OrderGrid: React.FC<OrderGridProps> = ({ orders, onUpdateStatus, onDelete }) => {
  return (
    <Grid container spacing={3}>
      {orders.map((order) => (
        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order.id}>
          <OrderCard 
            order={order} 
            onUpdateStatus={onUpdateStatus} 
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default OrderGrid;
