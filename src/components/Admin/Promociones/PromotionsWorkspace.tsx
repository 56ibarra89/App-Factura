import type { SyntheticEvent } from "react";
import {
  Box,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import type { AdminPromotionsViewModel } from "../../../hooks/useAdminPromotions";
import CertificacionesTab from "./CertificacionesTab";
import CuponesTab from "./CuponesTab";
import DescuentosTab from "./DescuentosTab";
import HappyHourTab from "./HappyHourTab";

interface PromotionsWorkspaceProps {
  promotions: AdminPromotionsViewModel;
}

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function PromotionTabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`promociones-tabpanel-${index}`}
      aria-labelledby={`promociones-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function accessibilityProps(index: number) {
  return {
    id: `promociones-tab-${index}`,
    "aria-controls": `promociones-tabpanel-${index}`,
  };
}

export default function PromotionsWorkspace({
  promotions,
}: PromotionsWorkspaceProps) {
  const handleTabChange = (_event: SyntheticEvent, value: number) => {
    promotions.changeTab(value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={promotions.activeTab}
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
          <Tab label="Descuentos Predefinidos" {...accessibilityProps(0)} />
          <Tab label="Happy Hour" {...accessibilityProps(1)} />
          <Tab label="Cupones Manuales" {...accessibilityProps(2)} />
          <Tab label="Certificaciones (Vales)" {...accessibilityProps(3)} />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <PromotionTabPanel value={promotions.activeTab} index={0}>
          <DescuentosTab
            rules={promotions.discounts.items}
            onAdd={promotions.discounts.openNew}
            onEdit={promotions.discounts.openEdit}
            onDelete={promotions.discounts.delete}
          />
        </PromotionTabPanel>
        <PromotionTabPanel value={promotions.activeTab} index={1}>
          <HappyHourTab
            rules={promotions.happyHours.items}
            onAdd={promotions.happyHours.openNew}
            onEdit={promotions.happyHours.openEdit}
            onDelete={promotions.happyHours.delete}
            onToggleStatus={promotions.happyHours.toggleStatus}
          />
        </PromotionTabPanel>
        <PromotionTabPanel value={promotions.activeTab} index={2}>
          <CuponesTab
            cupones={promotions.coupons.items}
            onAdd={promotions.coupons.openNew}
            onEdit={promotions.coupons.openEdit}
            onCopy={promotions.coupons.copy}
            onDelete={promotions.coupons.delete}
          />
        </PromotionTabPanel>
        <PromotionTabPanel value={promotions.activeTab} index={3}>
          <CertificacionesTab
            certificados={promotions.certificates.items}
            onEmit={promotions.certificates.openNew}
            onView={promotions.certificates.openDetail}
            onDelete={promotions.certificates.delete}
          />
        </PromotionTabPanel>
      </Box>
    </Paper>
  );
}
