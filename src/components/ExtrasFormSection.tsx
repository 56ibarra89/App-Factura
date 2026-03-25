import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { ExtraFormItem } from "../hooks/useProductForm";

interface ExtrasFormSectionProps {
  extras: ExtraFormItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onNameChange: (index: number, name: string) => void;
  onPriceChange: (extraIndex: number, sizeIndex: number, price: string) => void;
}

const ExtrasFormSection = ({
  extras,
  onAdd,
  onRemove,
  onNameChange,
  onPriceChange,
}: ExtrasFormSectionProps) => (
  <>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
      <Typography variant="subtitle1" fontWeight="bold">
        Ingredientes Extra
      </Typography>
      <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={onAdd}>
        Agregar extra
      </Button>
    </Box>

    {extras.length === 0 && (
      <Typography variant="body2" color="text.secondary" mb={2}>
        No hay extras configurados. Los clientes no podrán agregar ingredientes extra.
      </Typography>
    )}

    {extras.map((extra, extraIdx) => (
      <Paper key={extraIdx} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <TextField
            size="small"
            label="Nombre del extra"
            value={extra.name}
            onChange={(e) => onNameChange(extraIdx, e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton size="small" color="error" onClick={() => onRemove(extraIdx)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box display="flex" gap={1}>
          {extra.prices.map((p, sizeIdx) => (
            <TextField
              key={p.size}
              size="small"
              label={p.size}
              type="number"
              value={p.price}
              onChange={(e) => onPriceChange(extraIdx, sizeIdx, e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ min: 0, step: 0.5 }}
            />
          ))}
        </Box>
      </Paper>
    ))}
  </>
);

export default ExtrasFormSection;
