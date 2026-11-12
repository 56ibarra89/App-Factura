import type { FC } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2";

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
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: isCombo ? "primary.main" : "divider",
        boxShadow: "none",
        position: "relative",
        transition: "border-color 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "primary.main",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
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
