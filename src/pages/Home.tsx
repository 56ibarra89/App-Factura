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

const Home: React.FC = () => {
  const navigate = useNavigate();

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
    <Box p={2}>
      {/* Menú de usuario */}
      <AccountMenu />

      <Box
        display="grid"
        gridTemplateColumns="repeat(4, auto)"
        gap={2}
        px={2}
      >
        {menuItems.map((item, index) => (
          <Card elevation={4} key={index}>
            <CardActionArea onClick={item.action}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "90px",
                }}
              >
                {item.icon}
                <Typography
                  variant="subtitle1"
                  align="center"
                  mt={1}
                  fontWeight={500}
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