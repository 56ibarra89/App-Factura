import type { FC } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { LOGIN_COLORS } from "../../../shared/theme";

interface ProductCardProps {
  name: string;
  price: number;
  description?: string;
  isCombo?: boolean;
  onClick: () => void;
}

const ProductCard: FC<ProductCardProps> = ({
  name,
  price,
  description,
  isCombo,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: 200,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? "background.paper"
            : isCombo
            ? "#fff5f5"
            : "#fff2e6",
        borderRadius: 3,
        border: isCombo ? `1.5px solid ${LOGIN_COLORS.primary}` : undefined,
        boxShadow: 3,
        position: "relative",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
        },
      }}
    >
      {isCombo && (
        <Chip
          icon={<Inventory2Icon sx={{ fontSize: "0.85rem !important", color: "#fff" }} />}
          label="COMBO"
          size="small"
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            bgcolor: LOGIN_COLORS.primary,
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.65rem",
            height: 20,
          }}
        />
      )}

      {description && (
        <Tooltip
          title={description}
          arrow
          placement="top"
          enterTouchDelay={0}
          leaveTouchDelay={3000}
        >
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 4, right: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <InfoOutlinedIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>
      )}

      <CardContent>
        <Typography align="center" fontWeight="bold">
          {name}
        </Typography>
        <Typography align="center" color="text.secondary">
          C${price.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
