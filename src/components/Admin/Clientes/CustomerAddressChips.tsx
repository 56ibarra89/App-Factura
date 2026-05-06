/**
 * CustomerAddressChips — SRP: solo renderiza las direcciones de un cliente como Chips.
 * OCP: acepta callbacks para agregar/eliminar sin conocer el estado padre.
 */

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
import { CustomerAddress } from "../../../types/customer.types";

interface Props {
  addresses: CustomerAddress[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  /** Si true, los chips son solo de lectura (sin botón "x") */
  readOnly?: boolean;
}

const CustomerAddressChips: React.FC<Props> = ({
  addresses,
  onAdd,
  onRemove,
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
        Direcciones guardadas
      </Typography>

      {/* Lista de chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: readOnly ? 0 : 1.5 }}>
        {addresses.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
            Sin direcciones registradas
          </Typography>
        )}
        {addresses.map((addr) => (
          <Chip
            key={addr.id}
            icon={<HomeIcon />}
            label={addr.address}
            size="small"
            variant="outlined"
            color="primary"
            onDelete={readOnly ? undefined : () => onRemove(addr.id)}
            sx={{ maxWidth: 260 }}
          />
        ))}
      </Box>

      {/* Campo para agregar nueva dirección */}
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
