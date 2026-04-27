import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  CircularProgress,
} from "@mui/material";
import { UserAccount } from "../../types/user";
import { logService, SystemLog } from "../../services/logService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserActivityProps {
  user: UserAccount;
}

export function UserActivity({ user }: UserActivityProps) {
  const [activities, setActivities] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      setLoading(true);
      // Extraemos más logs para asegurar encontrar los del usuario
      const allLogs = await logService.getLogs(500);
      if (isMounted) {
        const userLogs = allLogs
          .filter((log) => log.user === user.username)
          .slice(0, 50);
        setActivities(userLogs);
        setLoading(false);
      }
    };

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [user.username]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        Bitácora de Actividad
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Últimos registros de acciones realizadas por{" "}
        <b>
          {user.firstName} {user.lastName}
        </b>
        .
      </Typography>

      {activities.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          No hay actividad reciente registrada para este usuario.
        </Typography>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            maxHeight: "440px",
            overflowY: "auto",
          }}
        >
          <Stepper orientation="vertical">
            {activities.map((step, index) => (
              <Step key={step.id || index} active={true}>
                <StepLabel
                  StepIconProps={{
                    sx: { color: index === 0 ? "primary.main" : "grey.500" },
                  }}
                >
                  <Typography
                    component="span"
                    fontWeight="bold"
                    color={index === 0 ? "text.primary" : "text.secondary"}
                  >
                    {step.action}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {format(step.timestamp, "dd MMM yyyy, hh:mm a", {
                      locale: es,
                    })}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.details || "Sin detalles adicionales."}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}
    </Box>
  );
}
