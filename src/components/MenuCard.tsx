import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

interface MenuCardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const MenuCard = ({ label, icon, onClick, disabled }: MenuCardProps) => (
  <Card
    elevation={disabled ? 1 : 4}
    sx={{
      borderRadius: 3,
      bgcolor: "white",
      border: "2px solid transparent",
      opacity: disabled ? 0.6 : 1,
      filter: disabled ? "grayscale(0.8)" : "none",
      pointerEvents: disabled ? "none" : "auto",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease",
      "&:hover": {
        transform: disabled ? "none" : "translateY(-4px)",
        borderColor: disabled ? "transparent" : "primary.main",
        boxShadow: disabled ? "none" : "0 12px 24px rgba(211, 47, 47, 0.15)",
        "& svg": { color: disabled ? "inherit" : "primary.main" },
      },
    }}
  >
    <CardActionArea disabled={disabled} onClick={onClick} sx={{ height: "100%", p: 1 }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "110px",
          p: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 1,
            "& svg": { transition: "color 0.2s ease" },
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="subtitle1"
          align="center"
          fontWeight={600}
          color={disabled ? "text.disabled" : "text.primary"}
          sx={{ lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        {disabled && (
          <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ mt: 0.5 }}>
            Bloqueado
          </Typography>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);

export default MenuCard;
