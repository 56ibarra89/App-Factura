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
    elevation={0}
    sx={{
      borderRadius: 2,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      opacity: disabled ? 0.6 : 1,
      filter: disabled ? "grayscale(0.8)" : "none",
      pointerEvents: disabled ? "none" : "auto",
      transition: "border-color 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out, filter 120ms ease-out, opacity 120ms ease-out",
      "&:hover": {
        bgcolor: disabled ? "background.paper" : "action.hover",
        borderColor: disabled ? "divider" : "primary.main",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
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
            "& svg": { transition: "color 120ms ease-out" },
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
