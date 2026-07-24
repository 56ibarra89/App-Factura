import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import type { UserAccount } from "../../../types/user";

interface ExtraDaysSectionProps {
  extraDays: NonNullable<UserAccount["extraDays"]>;
  hasExtraDayToday: boolean;
  onToggle: () => void;
}

export default function ExtraDaysSection({
  extraDays,
  hasExtraDayToday,
  onToggle,
}: ExtraDaysSectionProps) {
  return (
    <Box mb={4}>
      <Typography variant="subtitle1" fontWeight="700" mb={2}>
        Días Extra (Fuera de Horario)
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px dashed",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          bgcolor: hasExtraDayToday
            ? "rgba(46, 125, 50, 0.1)"
            : "transparent",
          borderColor: hasExtraDayToday
            ? "success.main"
            : "rgba(0,0,0,0.2)",
        }}
      >
        <Box>
          <Typography
            variant="body1"
            fontWeight="bold"
            color={hasExtraDayToday ? "success.main" : "text.primary"}
          >
            Habilitar turno extra hoy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Si el empleado no trabaja hoy, puedes agregarlo excepcionalmente
            para que aparezca en Delivery.
          </Typography>
        </Box>
        <Button
          variant={hasExtraDayToday ? "contained" : "outlined"}
          color={hasExtraDayToday ? "success" : "primary"}
          onClick={onToggle}
          sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 2 }}
        >
          {hasExtraDayToday ? "Día Extra Activo" : "Activar Día Extra"}
        </Button>
      </Paper>

      {extraDays.length > 0 && (
        <Box mt={3}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            mb={1}
            sx={{
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: "bold",
            }}
          >
            Días Extra (Este Mes)
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <List disablePadding>
              {extraDays.map((extraDay, index) => {
                const formattedDate = new Date(extraDay.date).toLocaleDateString(
                  "es-ES",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                );

                return (
                  <ListItem
                    key={extraDay.date}
                    divider={index < extraDays.length - 1}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarToday fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {formattedDate}
                        </Typography>
                      }
                    />
                    <Chip
                      label="Completado"
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
