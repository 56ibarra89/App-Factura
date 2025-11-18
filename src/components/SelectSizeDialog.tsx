// src/components/SelectSizeDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { useState } from "react";
import { ProductPrice, ProductSize } from "../context/ProductContext";

interface SelectSizeDialogProps {
  open: boolean;
  productName: string;
  prices: ProductPrice[];
  onClose: () => void;
  onSelect: (selected: { name: string; price: number; size: ProductSize }) => void;
}

export default function SelectSizeDialog({
  open,
  productName,
  prices,
  onClose,
  onSelect,
}: SelectSizeDialogProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | "">("");

  const handleConfirm = () => {
    const sizeObj = prices.find((p) => p.size === selectedSize);
    if (sizeObj) {
      onSelect({
        name: productName,
        price: sizeObj.price,
        size: sizeObj.size,
      });
      setSelectedSize("");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Selecciona un tamaño</DialogTitle>
      <DialogContent>
        <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
          {prices.map((p) => {
            const isSelected = selectedSize === p.size;
            return (
              <Button
                key={p.size}
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "primary" : "inherit"}
                onClick={() => setSelectedSize(p.size)}
                sx={{
                  flex: "1 1 30%",
                  minWidth: 100,
                  py: 2,
                  textTransform: "capitalize",
                  borderRadius: 2,
                  fontWeight: 500,
                }}
              >
                {p.size} - ${p.price.toFixed(2)}
              </Button>
            );
          })}
        </Box>

        {!selectedSize && (
          <Typography color="error" variant="body2" mt={2}>
            Debes seleccionar un tamaño
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!selectedSize}
          onClick={handleConfirm}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
}