import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface ProductCardProps {
  name: string;
  price: number;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: 200,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        bgcolor: "#fff2e6",
        borderRadius: 3,
        boxShadow: 3,
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Typography align="center" fontWeight="bold">
          {name}
        </Typography>
        <Typography align="center" color="text.secondary">
          ${price.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;