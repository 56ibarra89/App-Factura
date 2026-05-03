import Box from "@mui/material/Box";
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface PinDotsProps {
  pin: string;
  MAX_PIN_LENGTH: number;
}

export const PinDots = ({ pin, MAX_PIN_LENGTH }: PinDotsProps) => {
  const dots = [];
  for (let i = 0; i < MAX_PIN_LENGTH; i++) {
    dots.push(
      <Box
        key={`pin-dot-${i}`}
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: i < pin.length ? LOGIN_COLORS.primary : "grey.300",
          mx: 1.5,
          transition: "all 0.2s ease-in-out",
          boxShadow: i < pin.length ? `0 4px 12px ${LOGIN_COLORS.dotActiveShadow}` : "none",
        }}
      />
    );
  }
  return (
    <Box display="flex" justifyContent="center" mb={5}>
      {dots}
    </Box>
  );
};
