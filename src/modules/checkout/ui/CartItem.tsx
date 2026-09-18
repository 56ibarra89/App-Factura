import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import Chip from "@mui/material/Chip";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useState } from "react";
import type { SelectedExtra } from "../../catalog";
import type { SelectedComboOptionItem } from "../../orders";
import type { KitchenModifierSelection } from "../../settings/model/kitchenModifiers.types";
import { LOGIN_COLORS } from "../../../shared/theme";
import KitchenModifiersDialog from "./KitchenModifiersDialog";
import KitchenModifierChips from "../../orders/ui/KitchenModifierChips";

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  extras?: SelectedExtra[];
  note?: string;
  categoryId?: string;
  kitchenModifiers?: KitchenModifierSelection[];
  isCombo?: boolean;
  comboSelections?: SelectedComboOptionItem[];
  onAdd: () => void;
  onRemove: () => void;
  onChangeQuantity?: (qty: number) => void;
  giftQuantity?: number;
  onChangeGiftQuantity?: (qty: number) => void;
  onChangeKitchenInstructions?: (
    modifiers: KitchenModifierSelection[],
    note: string,
  ) => void;
}

const EMPTY_EXTRAS: SelectedExtra[] = [];

const CartItem = ({
  name,
  price,
  quantity,
  extras = EMPTY_EXTRAS,
  note,
  categoryId,
  kitchenModifiers,
  isCombo,
  comboSelections,
  onAdd,
  onRemove,
  onChangeQuantity,
  giftQuantity = 0,
  onChangeGiftQuantity,
  onChangeKitchenInstructions,
}: CartItemProps) => {
  const [modifierDialogOpen, setModifierDialogOpen] = useState(false);

  return (
    <>
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
        <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
          <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
            <Typography fontWeight="bold">{name}</Typography>
            {isCombo && (
              <Chip
                icon={
                  <Inventory2Icon
                    sx={{ fontSize: "0.75rem !important", color: "#fff" }}
                  />
                }
                label="COMBO"
                size="small"
                sx={{
                  bgcolor: LOGIN_COLORS.primary,
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.6rem",
                  height: 18,
                }}
              />
            )}
          </Box>

          {/* Desglose de ítems seleccionados del combo */}
          {comboSelections && comboSelections.length > 0 && (
            <Box
              mt={0.5}
              mb={0.5}
              pl={1}
              sx={{
                borderLeft: "2px solid",
                borderColor: LOGIN_COLORS.primary,
              }}
            >
              {comboSelections.map((s, sIdx) => {
                const sizeText =
                  s.size && s.size !== "único" ? ` (${s.size})` : "";
                const extraText =
                  s.extraPrice && s.extraPrice > 0
                    ? ` (+C$${s.extraPrice.toFixed(2)})`
                    : "";
                return (
                  <Typography
                    key={sIdx}
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: "0.75rem",
                      lineHeight: 1.3,
                    }}
                  >
                    • {s.quantity}x {s.productName}
                    {sizeText}
                    {extraText}
                  </Typography>
                );
              })}
            </Box>
          )}

          {extras.length > 0 && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ display: "block" }}
            >
              + {extras.map((e) => e.name).join(", ")}
            </Typography>
          )}
          <KitchenModifierChips modifiers={kitchenModifiers} compact />
          {note && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ display: "block", fontStyle: "italic" }}
            >
              Nota: {note}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            C${price.toFixed(2)} x {quantity} = C$
            {(price * Math.max(0, quantity - giftQuantity)).toFixed(2)}
          </Typography>
          {onChangeKitchenInstructions && (
            <Button
              size="small"
              variant="text"
              startIcon={<EditNoteIcon />}
              onClick={() => setModifierDialogOpen(true)}
              sx={{ mt: 0.5, px: 0, fontWeight: 800 }}
            >
              Modificadores / nota
            </Button>
          )}
          {giftQuantity > 0 && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <CardGiftcardIcon fontSize="small" /> {giftQuantity} de regalo
              (-C${(price * giftQuantity).toFixed(2)})
            </Typography>
          )}
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          gap={1}
          alignItems="flex-end"
        >
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
                  MozAppearance: "textfield",
                },
              }}
              size="small"
              sx={{
                width: 60,
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none",
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
                onClick={() =>
                  onChangeGiftQuantity(Math.max(0, giftQuantity - 1))
                }
                disabled={giftQuantity <= 0}
                sx={{ padding: 0.5 }}
              >
                <RemoveIcon fontSize="inherit" />
              </IconButton>
              <Typography variant="body2">{giftQuantity}</Typography>
              <IconButton
                size="small"
                onClick={() =>
                  onChangeGiftQuantity(Math.min(quantity, giftQuantity + 1))
                }
                disabled={giftQuantity >= quantity}
                sx={{ padding: 0.5 }}
              >
                <AddIcon fontSize="inherit" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
      {onChangeKitchenInstructions && (
        <KitchenModifiersDialog
          open={modifierDialogOpen}
          productName={name}
          categoryId={categoryId}
          selected={kitchenModifiers ?? []}
          note={note}
          onClose={() => setModifierDialogOpen(false)}
          onSave={(modifiers, nextNote) => {
            onChangeKitchenInstructions(modifiers, nextNote);
            setModifierDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CartItem;
