import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { BackButton } from "../../BackButton";

interface CustomerAdminHeaderProps {
  onCreate: () => void;
}

export default function CustomerAdminHeader({
  onCreate,
}: CustomerAdminHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 4,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <BackButton id="admin-clientes-back-btn" to="/admin" sx={{ mr: 0 }} />
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}
          >
            <PeopleAltIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>
              Gestión de Clientes
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Consulta, crea, edita y elimina la información de tus clientes.
          </Typography>
        </Box>
      </Box>

      <Button
        id="admin-clientes-new-btn"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          px: 3,
          py: 1,
          alignSelf: "center",
        }}
      >
        Nuevo Cliente
      </Button>
    </Box>
  );
}
