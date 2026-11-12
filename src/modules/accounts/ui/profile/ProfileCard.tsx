import { Box, Typography, Avatar, Divider, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Security";
import logo from "../../../../assets/images/logo.png";
import {
  ROLE_LABELS,
  useAuth,
} from "../../../auth";

interface ProfileCardProps {
  username: string;
  fullName: string;
}

export function ProfileCard({ username, fullName }: ProfileCardProps) {
  const { role } = useAuth();

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: 64, height: 64, objectFit: "contain" }}
        />
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "action.hover",
            color: "primary.main",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <PersonIcon sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Divider sx={{ width: "100%", my: 2.5 }} />

      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" fontWeight={700}>
          {fullName || "Cargando..."}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Usuario</Typography>
          <Typography variant="body2" fontWeight={600}>@{username}</Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShieldIcon sx={{ fontSize: 18, color: "primary.main" }} />
          <Typography variant="body2" fontWeight={600}>
            {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role : "Sin rol"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

