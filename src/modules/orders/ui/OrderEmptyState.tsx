import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const OrderEmptyState: React.FC = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      py={10}
      bgcolor="background.paper"
      borderRadius={8}
      boxShadow="0 4px 20px rgba(0,0,0,0.05)"
    >
      <Typography color="text.secondary">No hay órdenes pendientes en este momento</Typography>
    </Box>
  );
};

export default OrderEmptyState;
