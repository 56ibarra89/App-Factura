import type { FC } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ProductCardProps {
  name: string;
  price: number;
  description?: string;
  onClick: () => void;
}

const ProductCard: FC<ProductCardProps> = ({ name, price, description, onClick }) => {
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
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fff2e6',
        borderRadius: 3,
        boxShadow: 3,
        position: "relative",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
        },
      }}
    >
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
