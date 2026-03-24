import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
// import LogoutIcon from "@mui/icons-material/Logout";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LockResetIcon from "@mui/icons-material/LockReset";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { InventorySharp } from "@mui/icons-material";
import AccountMenu from "../components/AccountMenu";
import logoImg from "../assets/images/logo.png";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username") || "Usuario";

  const menuItems = [
    {
      label: "Facturar",
      icon: <PointOfSaleIcon fontSize="large" color="primary" />,
      action: () => navigate("/facturacion"),
    },
    {
      label: "Órdenes",
      icon: <ListAltIcon fontSize="large" color="secondary" />,
      action: () => navigate("/ordenes"),
    },
    {
      label: "Mesas",
      icon: <TableRestaurantIcon fontSize="large" color="action" />,
      action: () => navigate("/mesas"),
    },
    {
      label: "Reportes",
      icon: <AssessmentIcon fontSize="large" color="success" />,
      action: () => navigate("/reporte"),
    },
    {
      label: "Ingresar Producto",
      icon: <InventorySharp fontSize="large" color="error" />,
      action: () => navigate("/producto"),
    },
    {
      label: "Anular Factura",
      icon: <CancelIcon fontSize="large" color="error" />,
      action: () => console.log("Anular Factura"),
    },
    {
      label: "Consultar Facturas",
      icon: <ReceiptIcon fontSize="large" color="primary" />,
      action: () => console.log("Consultar Facturas"),
    },
    {
      label: "Reimprimir Factura",
      icon: <ReceiptIcon fontSize="large" color="secondary" />,
      action: () => navigate("/Reimprimir"),
    },
    {
      label: "Abrir Caja",
      icon: <LocalAtmIcon fontSize="large" color="success" />,
      action: () => navigate("/abrircaja"),
    },
    {
      label: "Cerrar Caja",
      icon: <LocalAtmIcon fontSize="large" color="error" />,
      action: () => console.log("Cerrar Caja"),
    },
    {
      label: "Cierre de Caja",
      icon: <AttachMoneyIcon fontSize="large" color="warning" />,
      action: () => console.log("Cierre de Caja"),
    },
    {
      label: "Administración Caja",
      icon: <AdminPanelSettingsIcon fontSize="large" color="primary" />,
      action: () => navigate("/admincaja"),
    },
    {
      label: "Cuentas",
      icon: <AccountBalanceWalletIcon fontSize="large" color="action" />,
      action: () => navigate("/cuentas"),
    },
    {
      label: "Administración",
      icon: <AdminPanelSettingsIcon fontSize="large" color="success" />,
      action: () => navigate("/admin"),
    },
    {
      label: "Abrir Caja Dinero",
      icon: <LocalAtmIcon fontSize="large" color="secondary" />,
      action: () => console.log("Abrir Caja de Dinero"),
    },
    {
      label: "Cambiar Clave",
      icon: <LockResetIcon fontSize="large" color="error" />,
      action: () => navigate("/clave"),
    },
    // {
    //   label: "Salir",
    //   icon: <LogoutIcon fontSize="large" />,
    //   action: () => {
    //     sessionStorage.removeItem("loggedIn");
    //     window.location.href = "/"; // redirige de forma limpia a la página de inicio
    //   },
    // },
  ];

  return (
    <Box 
      minHeight="100vh"
      boxSizing="border-box"
      sx={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Fondo claro y cálido, idéntico al exterior del Login
        pt: 4, // Restaurado al tamaño que te gustaba
        pb: 4, // Un intermedio que cabrá sin sobrepasar
        px: { xs: 2, md: 6 }
      }}
    >
      {/* Cabecera muy simple y alineada */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} px={2}>
         <Box display="flex" alignItems="center" gap={2}>
            {/* Logo de Pizza To Go para mantener el branding */}
            <Box
              component="img"
              src={logoImg}
              alt="Pizza To Go"
              sx={{ width: 45, height: 45, borderRadius: "20%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", objectFit: "cover", bgcolor: "white" }}
            />
            <Typography variant="h5" fontWeight="800" color="text.primary" sx={{ letterSpacing: "-0.5px", display: { xs: 'none', sm: 'block' } }}>
               Bienvenido, {username}
            </Typography>
         </Box>

         {/* El AccountMenu renderiza su propio texto "Menú Principal" a la derecha */}
         <Box>
           <AccountMenu />
         </Box>
      </Box>

      {/* Cuadrícula limpia conservando la idea original pero con paleta adaptada */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} 
        gap={3} 
        px={2}
      >
        {menuItems.map((item, index) => (
          <Card 
            elevation={4} 
            key={index}
            sx={{
              borderRadius: 3,
              bgcolor: "white",
              border: "2px solid transparent",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "#d32f2f", // Contorno rojo al pasar el mouse (estilo Pizza To Go)
                boxShadow: "0 12px 24px rgba(211, 47, 47, 0.15)", // Resplandor rojo más suave para fondo blanco
                "& svg": { color: "#d32f2f" } // Obliga a los iconos a pintarse de rojo corporativo al hacer hover
              }
            }}
          >
            <CardActionArea onClick={item.action} sx={{ height: "100%", p: 1 }}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "110px", // Restaurado a tu aspecto amplio favorito
                  p: 1.5
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1, "& svg": { transition: "color 0.2s ease" } }}>
                  {item.icon}
                </Box>
                <Typography
                  variant="subtitle1"
                  align="center"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ lineHeight: 1.2 }}
                >
                  {item.label}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Home;
