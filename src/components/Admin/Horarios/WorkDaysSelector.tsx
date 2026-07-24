import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { LOGIN_COLORS } from "../../../theme/loginTheme";

const WEEK_DAYS = [
  { value: "MONDAY", label: "Lunes", short: "L" },
  { value: "TUESDAY", label: "Martes", short: "M" },
  { value: "WEDNESDAY", label: "Miércoles", short: "X" },
  { value: "THURSDAY", label: "Jueves", short: "J" },
  { value: "FRIDAY", label: "Viernes", short: "V" },
  { value: "SATURDAY", label: "Sábado", short: "S" },
  { value: "SUNDAY", label: "Domingo", short: "D" },
];

interface WorkDaysSelectorProps {
  selectedDays: string[];
  onToggle: (day: string) => void;
}

export default function WorkDaysSelector({
  selectedDays,
  onToggle,
}: WorkDaysSelectorProps) {
  return (
    <Box mb={4}>
      <Typography variant="subtitle1" fontWeight="700" mb={3}>
        Días Laborables Seleccionados
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {WEEK_DAYS.map((day) => {
          const selected = selectedDays.includes(day.value);

          return (
            <Paper
              key={day.value}
              onClick={() => onToggle(day.value)}
              elevation={selected ? 2 : 0}
              sx={{
                width: { xs: "calc(50% - 8px)", sm: "120px" },
                height: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 4,
                border: `2px solid ${selected ? LOGIN_COLORS.primary : "rgba(0,0,0,0.08)"}`,
                bgcolor: selected ? LOGIN_COLORS.primary : "transparent",
                color: selected ? "white" : "text.secondary",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  borderColor: selected
                    ? LOGIN_COLORS.primary
                    : "rgba(0,0,0,0.2)",
                },
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  opacity: selected ? 0.8 : 0.3,
                }}
              >
                {selected ? (
                  <CheckCircle fontSize="small" />
                ) : (
                  <RadioButtonUnchecked fontSize="small" />
                )}
              </Box>
              <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>
                {day.short}
              </Typography>
              <Typography
                variant="caption"
                fontWeight="600"
                sx={{ textTransform: "uppercase", letterSpacing: 1 }}
              >
                {day.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
