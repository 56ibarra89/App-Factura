import {
  Box,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PrintIcon from "@mui/icons-material/Print";
import type { Device } from "../../api/deviceGateway";
import DeviceCard from "./DeviceCard";

interface DeviceSectionProps {
  devices: Device[];
  type: "printer" | "drawer";
}

const SECTION_CONFIG = {
  printer: {
    title: "Impresoras Térmicas",
    icon: <PrintIcon color="primary" />,
  },
  drawer: {
    title: "Gavetas de Dinero",
    icon: <PointOfSaleIcon color="primary" />,
  },
};

export default function DeviceSection({
  devices,
  type,
}: DeviceSectionProps) {
  const config = SECTION_CONFIG[type];
  const matchingDevices = devices.filter((device) => device.type === type);

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        {config.icon}
        <Typography variant="h6" fontWeight="800">
          {config.title}
        </Typography>
        <Divider sx={{ flex: 1, opacity: 0.5 }} />
      </Box>
      <Grid container spacing={2}>
        {matchingDevices.map((device) => (
          <Grid size={{ xs: 12, sm: 6 }} key={device.id}>
            <DeviceCard device={device} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
