import { useState, useMemo } from "react";
import { Box, Typography, Button, Paper, Tabs, Tab, Grid, alpha, TextField, InputAdornment } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import AccountMenu from "../components/AccountMenu";
import { LOGIN_COLORS, LOGIN_GRADIENTS, LOGIN_SHADOWS } from "../theme/loginTheme";
import { useAccountManager } from "../hooks/useAccountManager";
import { UserList } from "../components/cuentas/UserList";
import { UserForm } from "../components/cuentas/UserForm";
import { UserActivity } from "../components/cuentas/UserActivity";

export default function Cuentas() {
  const navigate = useNavigate();
  const { users, saveUser, toggleUserStatus, deleteUser } = useAccountManager();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  // Filtrado de usuarios por nombre o rol
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, searchQuery]);

  const handleCreateNew = () => {
    setSelectedUserId(null);
    setTabIndex(0);
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Directorio de Cuentas"
        startContent={
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/home")}
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
              borderRadius: 2,
              px: 2,
              mr: 2,
            }}
          >
            Regresar
          </Button>
        }
        actions={<AccountMenu />}
      />

      <Grid container spacing={4} sx={{ mt: 2, flex: 1 }}>
        {/* Columna Izquierda: Lista de Usuarios */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ display: "flex", flexDirection: "column" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="900" sx={{ opacity: 0.8 }}>
              Usuarios ({users.length})
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleCreateNew}
              sx={{
                borderRadius: 4,
                bgcolor: LOGIN_COLORS.primary,
                fontWeight: "bold",
                boxShadow: LOGIN_SHADOWS.title
              }}
            >
              Nuevo
            </Button>
          </Box>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o rol..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2, bgcolor: "white", borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              borderRadius: 4,
              flex: 1,
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
              pr: 1
            }}
          >
            <UserList
              users={filteredUsers}
              selectedUserId={selectedUserId}
              onSelectUser={(id) => {
                setSelectedUserId(id);
                if (tabIndex !== 0 && tabIndex !== 1) setTabIndex(0);
              }}
            />
          </Box>
        </Grid>

        {/* Columna Derecha: Panel Dinámico */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: "white",
              borderRadius: 6,
              boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
              minHeight: "600px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            <Box sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 4,
              pt: 2,
              background: alpha("#f5f5f5", 0.5)
            }}>
              <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    transition: "0.2s"
                  }
                }}
              >
                <Tab label={selectedUser ? "Información de Cuenta" : "Ficha de Registro"} />
                <Tab label="Actividad Reciente" disabled={!selectedUser} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 3, md: 5 }, flex: 1, overflowY: "auto" }}>
              {tabIndex === 0 && (
                <UserForm 
                  user={selectedUser} 
                  onSave={(user) => {
                    saveUser(user);
                    setSelectedUserId(user.id);
                  }}
                  onToggleStatus={toggleUserStatus}
                  onDelete={(id) => {
                    const confirm = window.confirm("¿Estás seguro de que deseas eliminar este usuario de forma permanente?");
                    if (confirm) {
                      deleteUser(id);
                      setSelectedUserId(null);
                      setTabIndex(0);
                    }
                  }}
                />
              )}
              {tabIndex === 1 && selectedUser && (
                <UserActivity user={selectedUser} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
