import { Box, Typography, Avatar, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Security";
import { LOGIN_GRADIENTS, LOGIN_SHADOWS } from "../../../../shared/theme";
import logo from "../../../../assets/images/logo.png"; // Usamos el logo
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
        background: LOGIN_GRADIENTS.brandingPanel,
        color: "white",
        p: 4,
        borderRadius: 4,
        boxShadow: LOGIN_SHADOWS.card,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Fondo decorativo radial para dar profundidad */}
      <Box 
        sx={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: LOGIN_GRADIENTS.brandingPanelRadial,
          opacity: 0.6,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Logo de la empresa */}
        <Box 
          component="img" 
          src={logo} 
          alt="Logo" 
          sx={{ width: 120, mb: 4, filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.5))" }} 
        />

        {/* Avatar grande */}
        <Avatar 
          sx={{ 
            width: 90, 
            height: 90, 
            mb: 2, 
            bgcolor: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)"
          }}
        >
          <PersonIcon sx={{ fontSize: 50, color: "white" }} />
        </Avatar>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {fullName || "Cargando..."}
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.6)" mb={3}>
          @{username}
        </Typography>

        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            bgcolor: "rgba(255,255,255,0.08)", 
            px: 2, 
            py: 0.8, 
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <ShieldIcon sx={{ fontSize: 18, color: role === "admin" ? "#4caf50" : "#2196f3" }} />
          <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 1, textTransform: "uppercase" }}>
            {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role : ""}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
