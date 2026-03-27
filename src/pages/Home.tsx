import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AccountMenu from "../components/AccountMenu";
import MenuCard from "../components/MenuCard";
import PageHeader from "../components/PageHeader";
import { getMenuItems } from "../data/menuItems";
import logoImg from "../assets/images/logo.png";
import { useAuth } from "../context/AuthContext";
import { LOGIN_GRADIENTS } from "../theme/loginTheme";

const Home = () => {
  const navigate = useNavigate();
  const { username } = useAuth();
  const menuItems = getMenuItems();

  return (
    <Box
      minHeight="100vh"
      boxSizing="border-box"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
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
              bgcolor: "white",
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
        {menuItems.map((item) => (
          <MenuCard
            key={item.label}
            label={item.label}
            icon={item.icon}
            onClick={item.route ? () => navigate(item.route!) : item.action ?? (() => {})}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Home;
