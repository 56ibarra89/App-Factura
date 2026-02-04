import { Paper } from "@mui/material";
import { ReactNode } from "react";

interface FormCardProps {
  children: ReactNode;
}

export function FormCard({ children }: FormCardProps) {
  return (
    <Paper
      elevation={4}
      sx={{ p: 4, width: 420, borderRadius: 3 }}
    >
      {children}
    </Paper>
  );
}