import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import logoImg from "../../../assets/images/logo.png";
import {
  LOGIN_GRADIENTS,
  LOGIN_SHADOWS,
} from "../../../shared/theme";

interface BrandingPanelProps {
  title: ReactNode;
  subtitle: string;

  footerAction?: ReactNode;

  compactMobile?: boolean;
}

export const BrandingPanel = ({
  title,
  subtitle,
  footerAction,
  compactMobile = false,
}: BrandingPanelProps) => (
  <Box
    sx={{
      flex: { xs: "none", md: 1 },
      background: LOGIN_GRADIENTS.brandingPanel,
      backgroundImage: LOGIN_GRADIENTS.brandingPanelRadial,
      color: "white",
      p: compactMobile ? { xs: 2, md: 6 } : { xs: 4, sm: 6 },
      display: "flex",
      flexDirection: compactMobile ? { xs: "row", md: "column" } : "column",
      justifyContent: footerAction ? "space-between" : "center",
      alignItems: compactMobile
        ? { xs: "center", md: "flex-start" }
        : "flex-start",
      textAlign: compactMobile ? { xs: "center", md: "left" } : "left",
      position: "relative",
      gap: compactMobile ? { xs: 2, md: 0 } : 0,
    }}
  >
    <Box mt={footerAction ? 2 : 0}>
      {}
      <Box
        component="img"
        src={logoImg}
        alt="Pizza To Go Logo"
        sx={{
          width: compactMobile ? { xs: 50, md: 110 } : 110,
          height: compactMobile ? { xs: 50, md: 110 } : 110,
          borderRadius: "25%",
          mb: compactMobile ? { xs: 0, md: 4 } : 4,
          boxShadow: LOGIN_SHADOWS.logo,
          objectFit: "cover",
          border: "3px solid rgba(255,255,255,0.2)",
          bgcolor: "white",
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src =
            "https://via.placeholder.com/110/cf1f2e/ffffff?text=LOGO";
        }}
      />

      {}
      {compactMobile && (
        <Typography
          variant="h5"
          fontWeight="800"
          sx={{ display: { xs: "block", md: "none" }, m: 0 }}
        >
          Pizza To Go
        </Typography>
      )}

      {}
      <Box sx={compactMobile ? { display: { xs: "none", md: "block" } } : {}}>
        <Typography
          variant="h3"
          fontWeight="900"
          mb={2}
          sx={{
            textShadow: LOGIN_SHADOWS.title,
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          fontWeight="400"
          sx={{ opacity: 0.85, maxWidth: 350, lineHeight: 1.5 }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>

    {footerAction}
  </Box>
);

