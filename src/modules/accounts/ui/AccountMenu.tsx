import React from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { NotificationsMenu } from "../../notifications";
import { Box } from "@mui/material";

const AccountMenu: React.FC = () => {
  const navigate = useNavigate();
  const { username, role, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [logoutMessage, setLogoutMessage] = React.useState("");
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const result = await logout();
    setIsLoggingOut(false);

    if (!result.success) {
      setLogoutMessage(
        result.message ||
          "No puedes cerrar sesión mientras la caja permanezca abierta.",
      );
      return;
    }

    navigate("/");
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <NotificationsMenu />
      <Tooltip title="Configuración de cuenta">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {(username || "U").charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem disabled>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          {username || "Usuario"}
        </MenuItem>

        <Divider />

        {role !== "motorizado" && (
          <MenuItem onClick={() => navigate("/perfil")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Configuración
          </MenuItem>
        )}

        <MenuItem onClick={() => void handleLogout()} disabled={isLoggingOut}>
          <ListItemIcon>
            {isLoggingOut ? <CircularProgress size={20} /> : <Logout fontSize="small" />}
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
      <Snackbar
        open={Boolean(logoutMessage)}
        autoHideDuration={6000}
        onClose={() => setLogoutMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setLogoutMessage("")}
          sx={{ width: "100%" }}
        >
          {logoutMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountMenu;
