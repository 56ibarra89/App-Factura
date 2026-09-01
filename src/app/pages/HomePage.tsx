import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Fab, Tooltip } from "@mui/material";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { AccountMenu } from "../../modules/accounts";
import MenuCard from "../ui/MenuCard";
import { PageHeader } from "../../shared/ui";
import { getMenuItems } from "../navigation/menuItems";
import logoImg from "../../assets/images/logo.png";
import { useAuth } from "../../modules/auth";
import { useCaja } from "../../modules/cash-register";
import { DriverDeliveriesModal } from "../../modules/delivery";
import { ordersGateway } from "../../modules/orders";

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
  const [pendingDeliveredCount, setPendingDeliveredCount] = useState(0);

  const canManageDrivers =
    role === "admin" ||
    role === "cajero_principal" ||
    role === "cajero" ||
    role === "despachador";

  // Monitoreo de entregas pendientes de liquidar (status === 'delivered')
  useEffect(() => {
    if (!canManageDrivers) return;
    let isMounted = true;

    const checkDeliveredOrders = async () => {
      try {
        const currentOrders = await ordersGateway.listCurrent().catch(() => []);
        if (isMounted) {
          const count = (currentOrders || []).filter(
            (o) => o.orderType === "delivery" && o.status === "delivered"
          ).length;
          setPendingDeliveredCount(count);
        }
      } catch (error) {
        console.error("Error verificando entregas de motorizados:", error);
      }
    };

    void checkDeliveredOrders();
    const interval = setInterval(checkDeliveredOrders, 12000); // Consulta cada 12 segundos

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [canManageDrivers]);

  const isCajaAbierta = Boolean(currentShift);

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
          let isDisabled = false;

          if (item.label === "Abrir Caja") {
            // Si ya hay una caja abierta, nadie puede abrir otra
            isDisabled = isCajaAbierta;
          } else if (item.label === "Cerrar Caja") {
            // Solo se puede cerrar si existe una caja abierta
            isDisabled = !isCajaAbierta;
          }

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

      {/* FAB Control Motorizados con Animación Bounce */}
      {canManageDrivers && (
        <Tooltip
          title={
            pendingDeliveredCount > 0
              ? `¡Atención! ${pendingDeliveredCount} ${
                  pendingDeliveredCount === 1
                    ? "entrega lista para liquidar"
                    : "entregas listas para liquidar"
                }`
              : "Control Motorizados"
          }
          placement="left"
        >
          <Box
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 1000,
              "@keyframes bounceFab": {
                "0%, 20%, 50%, 80%, 100%": {
                  transform: "translateY(0)",
                },
                "40%": {
                  transform: "translateY(-12px)",
                },
                "60%": {
                  transform: "translateY(-6px)",
                },
              },
              animation:
                pendingDeliveredCount > 0
                  ? "bounceFab 2s infinite ease-in-out"
                  : "none",
            }}
          >
            <Fab
              color="secondary"
              aria-label="motorizados"
              onClick={() => setModalOpen(true)}
              sx={{
                boxShadow:
                  pendingDeliveredCount > 0
                    ? "0 0 24px rgba(156, 39, 176, 0.75)"
                    : "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.08)",
                },
              }}
            >
              <TwoWheelerIcon />
            </Fab>
          </Box>
        </Tooltip>
      )}

      {/* Modal de Control de Motorizados */}
      {canManageDrivers && (
        <DriverDeliveriesModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            // Revalidar conteo al cerrar el modal tras cobrar
            void ordersGateway.listCurrent().then((currentOrders) => {
              const count = (currentOrders || []).filter(
                (o) => o.orderType === "delivery" && o.status === "delivered"
              ).length;
              setPendingDeliveredCount(count);
            });
          }}
        />
      )}
    </Box>
  );
};

export default HomePage;
