import { Chip, Stack } from "@mui/material";
import type { KitchenModifierSelection } from "../../settings/model/kitchenModifiers.types";
import {
  formatKitchenModifier,
  KITCHEN_MODIFIER_COLORS,
} from "../../settings/model/kitchenModifiers.types";

interface KitchenModifierChipsProps {
  modifiers?: KitchenModifierSelection[];
  compact?: boolean;
}

export default function KitchenModifierChips({
  modifiers,
  compact = false,
}: KitchenModifierChipsProps) {
  if (!modifiers?.length) return null;

  return (
    <Stack direction="row" gap={0.7} flexWrap="wrap" mt={0.8}>
      {modifiers.map((modifier) => (
        <Chip
          key={modifier.id}
          size="small"
          color={KITCHEN_MODIFIER_COLORS[modifier.kind]}
          label={formatKitchenModifier(modifier)}
          sx={{
            height: compact ? 22 : 26,
            fontWeight: 900,
            fontSize: compact ? "0.7rem" : "0.78rem",
          }}
        />
      ))}
    </Stack>
  );
}
