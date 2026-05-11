import { IconButton, IconButtonProps } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface BackButtonProps extends Omit<IconButtonProps, 'onClick'> {
  /** Ruta a la que se navegará al hacer clic. Por defecto: "/home" */
  to?: string;
}

/**
 * Botón de regreso circular con diseño premium consistente en todo el proyecto.
 */
export const BackButton = ({ to = "/home", sx, ...props }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => navigate(to)}
      sx={{
        bgcolor: "white",
        boxShadow: 1,
        mr: 2,
        transition: "all 0.2s",
        "&:hover": { 
          bgcolor: "grey.100",
          transform: "scale(1.1)",
          boxShadow: 2,
        },
        ...sx,
      }}
      {...props}
    >
      <ArrowBackIcon color="primary" />
    </IconButton>
  );
};
