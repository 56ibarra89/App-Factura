// src/components/CartItem.tsx
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { SelectedExtra } from "../types/extras";

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  extras?: SelectedExtra[];
  note?: string;
  onAdd: () => void;
  onRemove: () => void;
  onChangeQuantity?: (qty: number) => void;
  giftQuantity?: number;
  onChangeGiftQuantity?: (qty: number) => void;
}

const CartItem = ({
  name,
  price,
  quantity,
  extras = [],
  note,
  onAdd,
  onRemove,
  onChangeQuantity,
  giftQuantity = 0,
  onChangeGiftQuantity,
}: CartItemProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 1,
        mb: 1,
      }}
    >
      <Box>
        <Typography fontWeight="bold">{name}</Typography>
        {extras.length > 0 && (
          <Typography variant="caption" color="primary.main" sx={{ display: "block" }}>
            + {extras.map((e) => e.name).join(", ")}
          </Typography>
        )}
        {note && (
          <Typography variant="caption" color="error.main" sx={{ display: "block", fontStyle: 'italic' }}>
            Nota: {note}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          ${price.toFixed(2)} x {quantity} = ${(price * Math.max(0, quantity - giftQuantity)).toFixed(2)}
        </Typography>
        {giftQuantity > 0 && (
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CardGiftcardIcon fontSize="small" /> {giftQuantity} de regalo (-${(price * giftQuantity).toFixed(2)})
          </Typography>
        )}
      </Box>
      <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
        <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={onRemove} size="small">
          <RemoveIcon fontSize="small" />
        </IconButton>

        <TextField
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && onChangeQuantity) {
              onChangeQuantity(value);
            }
          }}
          inputProps={{
            min: 1,
            style: {
              MozAppearance: 'textfield',
            }
          }}
          size="small"
          sx={{
            width: 60,
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          }}
        />

        <IconButton onClick={onAdd} size="small">
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      {onChangeGiftQuantity && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <CardGiftcardIcon fontSize="small" color="success" />
          <IconButton
            size="small"
            onClick={() => onChangeGiftQuantity(Math.max(0, giftQuantity - 1))}
            disabled={giftQuantity <= 0}
            sx={{ padding: 0.5 }}
          >
            <RemoveIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="body2">{giftQuantity}</Typography>
          <IconButton
            size="small"
            onClick={() => onChangeGiftQuantity(Math.min(quantity, giftQuantity + 1))}
            disabled={giftQuantity >= quantity}
            sx={{ padding: 0.5 }}
          >
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Box>
      )}
      </Box>
    </Paper>
  );
};

export default CartItem;