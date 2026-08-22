import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { AccountMenu } from "../../modules/accounts";
import MenuCard from "../ui/MenuCard";
import { PageHeader } from "../../shared/ui";
import { getMenuItems } from "../navigation/menuItems";
import logoImg from "../../assets/images/logo.png";
import { useAuth } from "../../modules/auth";
import { useCaja } from "../../modules/cash-register";
import { Fab, Tooltip } from "@mui/material";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { DriverDeliveriesModal } from "../../modules/delivery";

const HomePage = () => {
  const navigate = useNavigate();
  const { username, role } = useAuth();
  const { currentShift } = useCaja();
  const allMenuItems = getMenuItems();

  const menuItems = React.useMemo(() => {
    if (role === "cajero") {
      return allMenuItems.filter(
        (item) =>
          item.label === "Facturar" ||
          item.label === "Consultar Facturas" ||
          item.label === "Anular Factura" ||
          item.label === "Gastos de Caja"
      );
    }
    if (role === "cajero_principal") {
      return allMenuItems.filter(
        (item) =>
          item.label === "Facturar" ||
          item.label === "Consultar Facturas" ||
          item.label === "Anular Factura" ||
          item.label === "Abrir Caja" ||
          item.label === "Cerrar Caja" ||
          item.label === "Consultar Turnos" ||
          item.label === "Gastos de Caja"
      );
    }
    if (role === "despachador") {
      return allMenuItems.filter(
        (item) => item.label === "Delivery" || item.label === "Entregas Motorizado"
      );
    }
    if (role === "mesero") {
      return allMenuItems.filter((item) => item.label === "Mesas");
    }
    if (role === "cocinero") {
      return allMenuItems.filter(
        (item) => item.label === "Pantalla de Cocina" || item.label === "Órdenes"
      );
    }
    if (role === "motorizado") {
      return allMenuItems.filter((item) => item.label === "Entregas Motorizado");
    }
    return allMenuItems;
  }, [role, allMenuItems]);

  const [modalOpen, setModalOpen] = useState(false);
  const canManageDrivers = role === "admin" || role === "despachador";

  return (
    <Box
      minHeight="100vh"
      boxSizing="border-box"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title={`Bienvenido, ${username || "Usuario"}`}
        startContent={
          <Box
            component="img"
            src={logoImg}
            alt="Pizza To Go"
            sx={{
              width: 45,
              height: 45,
              borderRadius: "20%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              objectFit: "cover",
              bgcolor: "background.paper",
            }}
          />
        }
        actions={<AccountMenu />}
      />

      {/* Cuadrícula de menú */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={3}
        px={2}
      >
        {menuItems.map((item) => {
          const isDisabled =
            (item.label === "Abrir Caja" && !!currentShift) ||
            (item.label === "Cerrar Caja" && !currentShift);

          return (
            <MenuCard
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={
                item.route
                  ? () => navigate(item.route!)
                  : item.action ?? (() => {})
              }
              disabled={isDisabled}
            />
          );
        })}
      </Box>

      {/* FAB Control Motorizados */}
      {canManageDrivers && (
        <Tooltip title="Control Motorizados" placement="left">
          <Fab
            color="secondary"
            aria-label="motorizados"
            onClick={() => setModalOpen(true)}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <TwoWheelerIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Modal */}
      {canManageDrivers && (
        <DriverDeliveriesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </Box>
  );
};

export default HomePage;

