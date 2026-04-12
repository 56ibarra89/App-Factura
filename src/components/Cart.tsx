// src/components/Cart.tsx
import { Box, Typography, Divider, Button } from "@mui/material";
import CartItem from "../components/CartItem";
import { CartItemType } from "../types/cart";
import { formatItemName } from "../utils/formatUtils";

interface CartProps {
  cartItems: CartItemType[];
  total: number;
  onAddItem: (item: Omit<CartItemType, "quantity">) => void;
  onRemoveItem: (index: number) => void;
  onChangeQuantity: (index: number, quantity: number) => void;
  onChangeGiftQuantity: (index: number, quantity: number) => void;
  onPreviewClick: () => void;
  onSendToKitchen?: () => void;
  isTableOrder?: boolean;
}

const Cart = ({
  cartItems,
  total,
  onAddItem,
  onRemoveItem,
  onChangeQuantity,
  onChangeGiftQuantity,
  onPreviewClick,
  onSendToKitchen,
  isTableOrder,
}: CartProps) => {
  return (
    <Box
      width="300px"
      p={2}
      bgcolor="#f9f9f9"
      borderRadius={2}
      display="flex"
      flexDirection="column"
      maxHeight="100%"
      boxShadow={2}
    >
      <Typography variant="h6" fontWeight="bold" mb={1}>
        Tu pedido
      </Typography>
      <Divider />

      <Box flex={1} overflow="auto" pr={1} my={1}>
        {cartItems.map((item, i) => (
          <CartItem
            key={`${item.name}-${item.size}-${i}`}
            name={formatItemName(item.name, item.size)}
            price={item.price}
            quantity={item.quantity}
            extras={item.extras}
            note={item.note}
            giftQuantity={item.giftQuantity}
            onAdd={() =>
              onAddItem({
                name: item.name,
                price: item.price,
                size: item.size,
                extras: item.extras,
                note: item.note,
              })
            }
            onRemove={() => onRemoveItem(i)}
            onChangeQuantity={(qty) => onChangeQuantity(i, qty)}
            onChangeGiftQuantity={(qty) => onChangeGiftQuantity(i, qty)}
          />
        ))}
      </Box>

      <Divider sx={{ my: 1 }} />
      <Box position="sticky" bottom={0} bgcolor="#f9f9f9" pt={1}>
        <Typography fontWeight="bold" mb={1}>
          Total: ${total.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={cartItems.length === 0}
          onClick={onPreviewClick}
          sx={{ mb: 1 }}
        >
          Vista previa
        </Button>

        {isTableOrder && onSendToKitchen && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            disabled={cartItems.length === 0}
            onClick={onSendToKitchen}
          >
            Enviar a Cocina
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Cart;