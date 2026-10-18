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
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mr: 2,
        transition: "background-color 120ms ease-out, border-color 120ms ease-out",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "text.secondary",
        },
        ...sx,
      }}
      {...props}
    >
      <ArrowBackIcon color="primary" />
    </IconButton>
  );
};

