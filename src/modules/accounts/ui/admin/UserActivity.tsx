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
  Chip,
  Avatar,
} from "@mui/material";
import type { UserAccount } from "../../model/account.types";
import { logService, type SystemLog } from "../../../audit";
import { getActionMetadata } from "../../../audit/utils/logFormatter";
import { FormattedLogDetails } from "../../../audit/ui/FormattedLogDetails";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LoginIcon from "@mui/icons-material/Login";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import EventNoteIcon from "@mui/icons-material/EventNote";

interface UserActivityProps {
  user: UserAccount;
}

const renderActionIcon = (iconName: string) => {
  switch (iconName) {
    case "ReceiptLong":
      return <ReceiptLongIcon sx={{ fontSize: 16 }} />;
    case "Login":
      return <LoginIcon sx={{ fontSize: 16 }} />;
    case "LockOpen":
      return <LockOpenIcon sx={{ fontSize: 16 }} />;
    case "Logout":
      return <LogoutIcon sx={{ fontSize: 16 }} />;
    case "Settings":
      return <SettingsIcon sx={{ fontSize: 16 }} />;
    case "EventSeat":
      return <EventSeatIcon sx={{ fontSize: 16 }} />;
    case "AddCircle":
      return <AddCircleIcon sx={{ fontSize: 16 }} />;
    case "Edit":
      return <EditIcon sx={{ fontSize: 16 }} />;
    case "Delete":
      return <DeleteIcon sx={{ fontSize: 16 }} />;
    case "CleaningServices":
      return <CleaningServicesIcon sx={{ fontSize: 16 }} />;
    case "PersonAdd":
      return <PersonAddIcon sx={{ fontSize: 16 }} />;
    case "Person":
      return <PersonIcon sx={{ fontSize: 16 }} />;
    case "ManageAccounts":
      return <ManageAccountsIcon sx={{ fontSize: 16 }} />;
    case "PersonRemove":
      return <PersonRemoveIcon sx={{ fontSize: 16 }} />;
    default:
      return <EventNoteIcon sx={{ fontSize: 16 }} />;
  }
};

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
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            maxHeight: "440px",
            overflowY: "auto",
          }}
        >
          <Stepper orientation="vertical">
            {activities.map((step, index) => {
              const meta = getActionMetadata(step.action);

              return (
                <Step key={step.id || index} active={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: `${meta.color}.main`,
                          color: `${meta.color}.contrastText`,
                        }}
                      >
                        {renderActionIcon(meta.iconName)}
                      </Avatar>
                    )}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography fontWeight="bold" color="text.primary">
                        {meta.label}
                      </Typography>
                      <Chip
                        label={meta.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600 }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.2 }}
                    >
                      {format(step.timestamp, "dd MMM yyyy, hh:mm a", {
                        locale: es,
                      })}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ pb: 1, pt: 0.5 }}>
                      <FormattedLogDetails details={step.details} />
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      )}
    </Box>
  );
}
