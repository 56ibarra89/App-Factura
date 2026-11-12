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
import HomeIcon from "@mui/icons-material/Home";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import type { CustomerAddress } from "../model/customer.types";

interface Props {
  addresses: CustomerAddress[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onSetDefault?: (id: string) => void;
  readOnly?: boolean;
}

const CustomerAddressChips: React.FC<Props> = ({
  addresses,
  onAdd,
  onRemove,
  onSetDefault,
  readOnly = false,
}) => {
  const [newAddr, setNewAddr] = useState("");

  const handleAdd = () => {
    if (!newAddr.trim()) return;
    onAdd(newAddr.trim());
    setNewAddr("");
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
        Direcciones guardadas (⭐ Principal para Delivery)
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: readOnly ? 0 : 1.5 }}>
        {addresses.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
            Sin direcciones registradas
          </Typography>
        )}
        {addresses.map((addr) => (
          <Chip
            key={addr.id}
            icon={
              <Tooltip title={addr.isDefault ? "Dirección Principal" : "Dirección"}>
                <HomeIcon sx={{ color: addr.isDefault ? "#f59e0b !important" : undefined }} />
              </Tooltip>
            }
            label={
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <span>{addr.address}</span>
                {!readOnly && onSetDefault && (
                  <Tooltip title={addr.isDefault ? "Dirección Principal" : "Marcar como principal"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetDefault(addr.id);
                      }}
                      sx={{ p: 0.25, ml: 0.25 }}
                    >
                      {addr.isDefault ? (
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
            variant={addr.isDefault ? "filled" : "outlined"}
            color={addr.isDefault ? "primary" : "default"}
            onDelete={readOnly ? undefined : () => onRemove(addr.id)}
            sx={{
              maxWidth: 320,
              fontWeight: addr.isDefault ? 700 : 400,
              borderColor: addr.isDefault ? "primary.main" : "divider",
            }}
          />
        ))}
      </Box>

      {!readOnly && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            id="customer-new-address-input"
            size="small"
            fullWidth
            placeholder="Agregar dirección y presionar Enter..."
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Tooltip title="Agregar dirección">
            <span>
              <IconButton
                id="customer-add-address-btn"
                color="primary"
                onClick={handleAdd}
                disabled={!newAddr.trim()}
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

export default CustomerAddressChips;
