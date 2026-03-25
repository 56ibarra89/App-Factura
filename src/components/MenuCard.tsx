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
}

const MenuCard = ({ label, icon, onClick }: MenuCardProps) => (
  <Card
    elevation={4}
    sx={{
      borderRadius: 3,
      bgcolor: "white",
      border: "2px solid transparent",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        borderColor: "primary.main",
        boxShadow: "0 12px 24px rgba(211, 47, 47, 0.15)",
        "& svg": { color: "primary.main" },
      },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: "100%", p: 1 }}>
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
          color="text.primary"
          sx={{ lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default MenuCard;
