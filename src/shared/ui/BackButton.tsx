import { IconButton, IconButtonProps } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface BackButtonProps extends Omit<IconButtonProps, 'onClick'> {

  to?: string;
}

export const BackButton = ({ to = "/home", sx, ...props }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <IconButton
      onClick={() => navigate(to)}
      sx={{
        bgcolor: "background.paper",
        boxShadow: 1,
        mr: 2,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "action.hover",
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

