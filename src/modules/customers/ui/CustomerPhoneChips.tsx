import React, { useState } from "react";
import {
  Box,
  Chip,
  TextField,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import type { CustomerPhone } from "../model/customer.types";

interface Props {
  phones: CustomerPhone[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onSetDefault?: (id: string) => void;
  readOnly?: boolean;
}

const CustomerPhoneChips: React.FC<Props> = ({
  phones,
  onAdd,
  onRemove,
  onSetDefault,
  readOnly = false,
}) => {
  const [newPhone, setNewPhone] = useState("");

  const handleAdd = () => {
    if (!newPhone.trim()) return;
    onAdd(newPhone.trim());
    setNewPhone("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
        sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        Teléfonos guardados (⭐ Principal)
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: readOnly ? 0 : 1.5 }}>
        {phones.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
            Sin teléfonos registrados
          </Typography>
        )}
        {phones.map((p) => (
          <Chip
            key={p.id}
            icon={
              <Tooltip title={p.isDefault ? "Teléfono Principal" : "Teléfono"}>
                <PhoneIcon sx={{ color: p.isDefault ? "#f59e0b !important" : undefined }} />
              </Tooltip>
            }
            label={
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <span>{p.phone}</span>
                {!readOnly && onSetDefault && (
                  <Tooltip title={p.isDefault ? "Teléfono Principal" : "Marcar como principal"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefault(p.id);
                      }}
                      sx={{ p: 0.25, ml: 0.25 }}
                    >
                      {p.isDefault ? (
                        <StarIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                      ) : (
                        <StarBorderIcon sx={{ fontSize: 16, color: "text.secondary", "&:hover": { color: "#f59e0b" } }} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
            size="small"
            variant={p.isDefault ? "filled" : "outlined"}
            color={p.isDefault ? "primary" : "default"}
            onDelete={readOnly ? undefined : () => onRemove(p.id)}
            sx={{
              maxWidth: 240,
              fontWeight: p.isDefault ? 700 : 400,
              borderColor: p.isDefault ? "primary.main" : "divider",
            }}
          />
        ))}
      </Box>

      {!readOnly && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            id="customer-new-phone-input"
            size="small"
            fullWidth
            placeholder="Agregar teléfono y presionar Enter..."
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Tooltip title="Agregar teléfono">
            <span>
              <IconButton
                id="customer-add-phone-btn"
                color="primary"
                onClick={handleAdd}
                disabled={!newPhone.trim()}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default CustomerPhoneChips;
