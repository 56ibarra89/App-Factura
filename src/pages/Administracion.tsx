import { Box, Container, IconButton, Typography, Divider, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BusinessIcon from "@mui/icons-material/Business";
import SecurityIcon from "@mui/icons-material/Security";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PrintIcon from "@mui/icons-material/Print";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PercentIcon from "@mui/icons-material/Percent";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { AdminModuleCard } from "../components/Admin/AdminModuleCard";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../theme/loginTheme";

type AdminCategory = "General" | "Operativa" | "Hardware y Sistema";

interface AdminModuleItem {
  id: string;
  category: AdminCategory;
  title: string;
  description: string;
  icon: JSX.Element;
  action: () => void;
}

const Administracion = () => {
  const navigate = useNavigate();

  const adminModules: AdminModuleItem[] = [
    // --- GENERAL ---
    {
      id: "empresa",
      category: "General",
      title: "Datos de la Empresa",
      description: "Personaliza el logotipo, nombre de negocio, dirección, teléfono y pie de página de los tickets.",
      icon: <BusinessIcon fontSize="large" />,
      action: () => console.log("Ir a Empresa"),
    },
    {
      id: "configuracion",
      category: "General",
      title: "Control General",
      description: "Ajusta las preferencias del sistema, moneda local y comportamiento en la apertura de caja.",
      icon: <SettingsIcon fontSize="large" />,
      action: () => console.log("Ir a Configuración"),
    },
    {
      id: "impuestos",
      category: "General",
      title: "Impuestos",
      description: "Gestiona múltiples tasas impositivas y reglas especiales aisladas de la configuración habitual.",
      icon: <PercentIcon fontSize="large" />,
      action: () => console.log("Ir a Impuestos"),
    },

    // --- OPERATIVA ---
    {
      id: "usuarios",
      category: "Operativa",
      title: "Usuarios y Roles",
      description: "Administra el acceso al sistema, crea empleados y asigna permisos específicos por rol.",
      icon: <PeopleIcon fontSize="large" />,
      action: () => console.log("Ir a Usuarios"),
    },
    {
      id: "promociones",
      category: "Operativa",
      title: "Promociones",
      description: "Configura reglas automáticas de descuento, horas felices (Happy Hour) o cupones manuales.",
      icon: <LocalOfferIcon fontSize="large" />,
      action: () => console.log("Ir a Promociones"),
    },
    {
      id: "turnos",
      category: "Operativa",
      title: "Cajas y Turnos",
      description: "Define perfiles de turnos laborales y fija los montos de apertura en efectivo predeterminados.",
      icon: <AccessTimeIcon fontSize="large" />,
      action: () => console.log("Ir a Turnos"),
    },
    {
      id: "mesas",
      category: "Operativa",
      title: "Plano de Mesas",
      description: "Edita visualmente el diseño del restaurante, acomodando identificadores y salas libremente.",
      icon: <DashboardCustomizeIcon fontSize="large" />,
      action: () => console.log("Ir a Planos"),
    },
    
    // --- HARDWARE Y SISTEMA ---
    {
      id: "perifericos",
      category: "Hardware y Sistema",
      title: "Periféricos",
      description: "Administra impresoras térmicas (Múltiples), gavetas de dinero conectadas o básculas compatibles.",
      icon: <PrintIcon fontSize="large" />,
      action: () => console.log("Ir a Periféricos"),
    },
    {
      id: "auditoria",
      category: "Hardware y Sistema",
      title: "Bitácora de Auditoría",
      description: "Revisa el registro de auditoría de arqueos, cancelaciones de factura y movimientos sensibles.",
      icon: <SecurityIcon fontSize="large" />,
      action: () => console.log("Ir a Auditoría"),
    },
    {
      id: "facturacion_electronica",
      category: "Hardware y Sistema",
      title: "Correlativos Factura",
      description: "Gestiona los números de comprobante, rangos de folio autorizados y secuencias de facturación.",
      icon: <ReceiptLongIcon fontSize="large" />,
      action: () => console.log("Ir a Correlativos"),
    },
    {
      id: "respaldos",
      category: "Hardware y Sistema",
      title: "Respaldos de Datos",
      description: "Exporta la configuración, menú e histórico. Crea y restaura copias de seguridad totales.",
      icon: <SaveIcon fontSize="large" />,
      action: () => console.log("Ir a Respaldos"),
    }
  ];

  // Helper para renderizar categorías
  const renderCategory = (categoryName: AdminCategory) => {
    const modules = adminModules.filter(m => m.category === categoryName);
    if (modules.length === 0) return null;

    return (
      <Box key={categoryName} sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1 }}>
          {categoryName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={module.id}>
              <AdminModuleCard
                title={module.title}
                description={module.description}
                icon={module.icon}
                onClick={module.action}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Fondo decorativo enorme para darle "aire" de Control Center */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${LOGIN_COLORS.primarySubtle} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Centro de Control"
          startContent={
            <IconButton 
              onClick={() => navigate("/home")} 
              sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
          }
        />

        {/* Hero Section */}
        <Box sx={{ mt: 2, mb: 5, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            Bienvenido al panel de administración avanzado. Agrupamos todas las herramientas necesarias para que tengas el **control absoluto** sobre la configuración, escalabilidad y hardware de tu negocio, con un diseño intuitivo.
          </Typography>
        </Box>

        <Container maxWidth="xl" disableGutters>
          {renderCategory("General")}
          {renderCategory("Operativa")}
          {renderCategory("Hardware y Sistema")}
        </Container>
      </Box>
    </Box>
  );
};

export default Administracion;
