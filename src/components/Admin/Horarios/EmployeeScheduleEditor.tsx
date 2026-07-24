import {
  Avatar,
  Box,
  Button,
  Divider,
  Fade,
  Paper,
  Typography,
} from "@mui/material";
import { EventNote } from "@mui/icons-material";
import type { UserAccount } from "../../../types/user";
import { LOGIN_COLORS } from "../../../theme/loginTheme";
import ExtraDaysSection from "./ExtraDaysSection";
import WorkDaysSelector from "./WorkDaysSelector";

interface EmployeeScheduleEditorProps {
  user: UserAccount | null;
  workDays: string[];
  pastExtraDays: NonNullable<UserAccount["extraDays"]>;
  hasExtraDayToday: boolean;
  loading: boolean;
  onToggleWorkDay: (day: string) => void;
  onToggleExtraDay: () => void;
  onSave: () => void;
}

export default function EmployeeScheduleEditor({
  user,
  workDays,
  pastExtraDays,
  hasExtraDayToday,
  loading,
  onToggleWorkDay,
  onToggleExtraDay,
  onSave,
}: EmployeeScheduleEditorProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        minHeight: "100%",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {user ? (
        <Fade in timeout={500}>
          <Box flex={1} display="flex" flexDirection="column">
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar
                sx={{
                  bgcolor: "rgba(227, 26, 26, 0.1)",
                  color: LOGIN_COLORS.primary,
                  width: 56,
                  height: 56,
                }}
              >
                <EventNote fontSize="large" />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{ letterSpacing: "-0.5px" }}
                >
                  Horario de {user.firstName}
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={0.5}>
                  Configura los días de trabajo semanales para este empleado.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4, opacity: 0.6 }} />

            <WorkDaysSelector
              selectedDays={workDays}
              onToggle={onToggleWorkDay}
            />

            {user.role === "motorizado" && (
              <ExtraDaysSection
                extraDays={pastExtraDays}
                hasExtraDayToday={hasExtraDayToday}
                onToggle={onToggleExtraDay}
              />
            )}

            <Box mt="auto" display="flex" justifyContent="flex-end" pt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={onSave}
                disabled={loading}
                startIcon={<EventNote />}
                sx={{
                  fontWeight: "800",
                  textTransform: "none",
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  boxShadow: `0 8px 20px -8px ${LOGIN_COLORS.primary}`,
                  "&:hover": {
                    boxShadow: `0 12px 24px -8px ${LOGIN_COLORS.primary}`,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Guardar Cambios
              </Button>
            </Box>
          </Box>
        </Fade>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          minHeight={400}
          sx={{ opacity: 0.6 }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "action.hover",
              color: "text.disabled",
              mb: 2,
            }}
          >
            <EventNote sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" fontWeight="600">
            Selecciona un empleado
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Haz clic en un empleado para configurar sus días de trabajo
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
