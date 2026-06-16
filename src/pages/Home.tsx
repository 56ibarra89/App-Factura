import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AccountMenu from "../components/AccountMenu";
import MenuCard from "../components/MenuCard";
import PageHeader from "../components/PageHeader";
import { getMenuItems } from "../data/menuItems";
import logoImg from "../assets/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { useCaja } from "../context/CajaContext";
import { Fab, Tooltip } from "@mui/material";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DriverDeliveriesModal from "../components/DriverDeliveriesModal";
import React, { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  const { currentShift } = useCaja();
  const menuItems = getMenuItems();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Box
      minHeight="100vh"
      boxSizing="border-box"
      sx={{
        bgcolor: 'background.default',
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
        gridTemplateColumns={{ xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
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

      {/* Modal */}
      <DriverDeliveriesModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </Box>
  );
};

export default Home;
