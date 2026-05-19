import { useState, SyntheticEvent } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../../theme/loginTheme";
import DescuentosTab from "../../components/Admin/Promociones/DescuentosTab";
import HappyHourTab from "../../components/Admin/Promociones/HappyHourTab";
import CuponesTab from "../../components/Admin/Promociones/CuponesTab";
import CertificacionesTab from "../../components/Admin/Promociones/CertificacionesTab";
import {
  MOCK_HAPPY_HOURS,
  MOCK_DESCUENTOS,
  MOCK_CUPONES,
  MOCK_CERTIFICADOS,
  DescuentoRule,
  HappyHourRule,
} from "../../data/promocionesMockData";
import DescuentoDialog from "../../components/Admin/Promociones/DescuentoDialog";
import HappyHourDialog from "../../components/Admin/Promociones/HappyHourDialog";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`promociones-tabpanel-${index}`}
      aria-labelledby={`promociones-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `promociones-tab-${index}`,
    "aria-controls": `promociones-tabpanel-${index}`,
  };
}

const AdminPromociones = () => {
  const [tabValue, setTabValue] = useState(0);

  // ── Descuentos ─────────────────────────────────────────────────────────────
  const [descuentos, setDescuentos] = useState<DescuentoRule[]>(MOCK_DESCUENTOS);
  const [isDescuentoDialogOpen, setIsDescuentoDialogOpen] = useState(false);
  const [editingDescuento, setEditingDescuento] = useState<DescuentoRule | null>(null);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddDescuento = () => {
    setEditingDescuento(null);
    setIsDescuentoDialogOpen(true);
  };

  const handleEditDescuento = (item: DescuentoRule) => {
    setEditingDescuento(item);
    setIsDescuentoDialogOpen(true);
  };

  const handleDeleteDescuento = (id: number) => {
    setDescuentos(descuentos.filter(d => d.id !== id));
  };

  const handleSaveDescuento = (rule: DescuentoRule) => {
    if (editingDescuento) {
      setDescuentos(descuentos.map(d => d.id === rule.id ? rule : d));
    } else {
      setDescuentos([...descuentos, rule]);
    }
  };

  // ── Happy Hour ──────────────────────────────────────────────────────────────
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>(MOCK_HAPPY_HOURS);
  const [isHHDialogOpen, setIsHHDialogOpen] = useState(false);
  const [editingHH, setEditingHH] = useState<HappyHourRule | null>(null);

  const handleAddHH = () => {
    setEditingHH(null);
    setIsHHDialogOpen(true);
  };

  const handleEditHH = (rule: HappyHourRule) => {
    setEditingHH(rule);
    setIsHHDialogOpen(true);
  };

  const handleDeleteHH = (id: number) => {
    setHappyHours(happyHours.filter(h => h.id !== id));
  };

  const handleSaveHH = (rule: HappyHourRule) => {
    if (editingHH) {
      setHappyHours(happyHours.map(h => h.id === rule.id ? rule : h));
    } else {
      setHappyHours([...happyHours, rule]);
    }
  };

  const handleToggleHHStatus = (id: number) => {
    setHappyHours(happyHours.map(h =>
      h.id === id
        ? { ...h, status: h.status === "Activo" ? "Inactivo" : "Activo" }
        : h
    ));
  };

  // ── Cupones / Certificados (pendiente de implementación real) ───────────────
  const handleAdd = () => console.log("TODO: abrir formulario de creación");
  const handleDelete = (id: number) => console.log("TODO: eliminar", id);
  const handleCopy = (code: string) => navigator.clipboard?.writeText(code);
  const handleView = (item: unknown) => console.log("TODO: ver detalle", item);

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Elemento de Fondo Decorativo */}
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
          pointerEvents: "none",
        }}
      />

      <Box position="relative" zIndex={1}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <BackButton to="/admin" />
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{ letterSpacing: "-1px" }}
          >
            Gestión de Promociones
          </Typography>
        </Box>

        <Box sx={{ mb: 5, pl: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Desde esta sección centralizada, tienes el control total para gestionar{" "}
            <b>descuentos inteligentes</b> aplicables a tus productos, programar horarios de{" "}
            <b>Happy Hour</b> dinámicos, lanzar campañas de <b>cupones personalizados</b> para
            atraer nuevos clientes y emitir <b>certificados de producto</b> exclusivos como
            parte de tus programas de regalías y beneficios corporativos.
          </Typography>
        </Box>

        <Container maxWidth="xl" disableGutters>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              overflow: "hidden",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="Pestañas de promociones"
                sx={{
                  px: 2,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    minHeight: 64,
                  },
                }}
              >
                <Tab label="Descuentos Automáticos" {...a11yProps(0)} />
                <Tab label="Happy Hour" {...a11yProps(1)} />
                <Tab label="Cupones Manuales" {...a11yProps(2)} />
                <Tab label="Certificaciones (Vales)" {...a11yProps(3)} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <CustomTabPanel value={tabValue} index={0}>
                <DescuentosTab
                  rules={descuentos}
                  onAdd={handleAddDescuento}
                  onEdit={handleEditDescuento}
                  onDelete={handleDeleteDescuento}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabValue} index={1}>
                <HappyHourTab
                  rules={happyHours}
                  onAdd={handleAddHH}
                  onEdit={handleEditHH}
                  onDelete={handleDeleteHH}
                  onToggleStatus={handleToggleHHStatus}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabValue} index={2}>
                <CuponesTab
                  cupones={MOCK_CUPONES}
                  onAdd={handleAdd}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabValue} index={3}>
                <CertificacionesTab
                  certificados={MOCK_CERTIFICADOS}
                  onAdd={handleAdd}
                  onView={handleView}
                />
              </CustomTabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>

      <DescuentoDialog
        open={isDescuentoDialogOpen}
        onClose={() => setIsDescuentoDialogOpen(false)}
        onSave={handleSaveDescuento}
        editingRule={editingDescuento}
      />

      <HappyHourDialog
        open={isHHDialogOpen}
        onClose={() => setIsHHDialogOpen(false)}
        onSave={handleSaveHH}
        editingRule={editingHH}
      />
    </Box>
  );
};

export default AdminPromociones;
