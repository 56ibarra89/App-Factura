import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  alpha,
  IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface TableOption {
  id: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (tableId: string) => void;
  options: TableOption[];
  title: string;
}

export default function TableSelectDialog({
  open,
  onClose,
  onConfirm,
  options,
  title,
}: Props) {
  const [selectedTable, setSelectedTable] = useState<string>("");

  const handleConfirm = () => {
    if (selectedTable) {
      onConfirm(selectedTable);
      setSelectedTable("");
    }
  };

  const handleClose = () => {
    setSelectedTable("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 24px 48px rgba(0,0,0,0.1)",
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 3, 
        pb: 2,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: 'grey.500',
            "&:hover": { bgcolor: "grey.100" }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "grey.200" }}>
        {options.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <EventSeatIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight="medium">
              Sin mesas disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay mesas vacías para realizar esta acción.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {options.map((opt) => {
              const isSelected = selectedTable === opt.id;
              
              // Simplificamos el texto si viene con mucho detalle
              const parts = opt.label.split('-');
              const subTitle = parts[0]?.trim() || '';
              const shortTitle = parts.slice(1).join('-').trim() || opt.label;

              return (
                <Grid size={{ xs: 6, sm: 4 }} key={opt.id}>
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => setSelectedTable(opt.id)}
                    sx={{
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: isSelected ? LOGIN_COLORS.primary : "grey.300",
                      color: isSelected ? "white" : "text.secondary",
                      bgcolor: isSelected ? LOGIN_COLORS.primary : "white",
                      boxShadow: isSelected ? `0 8px 16px ${alpha(LOGIN_COLORS.primary, 0.4)}` : "none",
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: isSelected ? LOGIN_COLORS.primary : LOGIN_COLORS.primary,
                        bgcolor: isSelected ? LOGIN_COLORS.primary : alpha(LOGIN_COLORS.primary, 0.05),
                        color: isSelected ? "white" : LOGIN_COLORS.primary,
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 12px ${alpha(LOGIN_COLORS.primary, 0.15)}`
                      },
                      transition: "all 0.2s"
                    }}
                  >
                    <EventSeatIcon sx={{ mb: 1, fontSize: 28, opacity: isSelected ? 1 : 0.7 }} />
                    <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                      {shortTitle}
                    </Typography>
                    {subTitle && subTitle !== shortTitle && (
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, fontSize: "0.7rem", fontWeight: "medium" }}>
                        {subTitle}
                      </Typography>
                    )}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, pb: 3, bgcolor: "grey.50" }}>
        <Button 
          onClick={handleClose} 
          variant="text" 
          color="inherit"
          sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedTable}
          disableElevation
          sx={{ 
            fontWeight: "bold", 
            borderRadius: 2, 
            px: 4,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": {
              bgcolor: LOGIN_COLORS.primaryDark
            }
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
