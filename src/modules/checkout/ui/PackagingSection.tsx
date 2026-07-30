import { Box, Button, Typography } from "@mui/material";
import type { PackagingSizeConfig } from "../../catalog";

interface PackagingSectionProps {
  packaging: PackagingSizeConfig[];
  quantities: Record<string, number>;
  onChange: (name: string, quantity: number) => void;
}

export default function PackagingSection({
  packaging,
  quantities,
  onChange,
}: PackagingSectionProps) {
  if (packaging.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        bgcolor: "background.default",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        Empaques Utilizados
      </Typography>
      {packaging.map((item) => {
        const quantity = quantities[item.name] ?? 0;
        return (
          <Box
            key={item.name}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2">
              {item.name} (C${item.price.toFixed(2)})
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: 32, p: 0 }}
                onClick={() => onChange(item.name, Math.max(0, quantity - 1))}
              >
                -
              </Button>
              <Typography variant="body2" width={20} textAlign="center">
                {quantity}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: 32, p: 0 }}
                onClick={() => onChange(item.name, quantity + 1)}
              >
                +
              </Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
