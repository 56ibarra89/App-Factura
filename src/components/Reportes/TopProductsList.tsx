import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip
} from "@mui/material";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import { LOGIN_SHADOWS, LOGIN_GRADIENTS } from "../../theme/loginTheme";
import { TopProduct } from "../../hooks/useDailyReport";

interface TopProductsListProps {
  products: TopProduct[];
}

export const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: LOGIN_SHADOWS.card,
        background: LOGIN_GRADIENTS.pageBackground,
        height: '100%'
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalPizzaIcon color="primary" /> Productos Más Vendidos
        </Typography>
        
        {products.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Aún no hay ventas el día de hoy.
          </Typography>
        ) : (
          <List disablePadding>
            {products.slice(0, 5).map((product, index) => (
              <React.Fragment key={product.name}>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ 
                    minWidth: 28, 
                    fontWeight: 'bold', 
                    color: index < 3 ? 'primary.main' : 'text.secondary'
                  }}>
                    #{index + 1}
                  </Box>
                  <ListItemText
                    primary={product.name}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                    <Chip size="small" label={`${product.quantity} uds`} color="primary" variant={index < 3 ? "filled" : "outlined"} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      ${product.totalRevenue.toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
                {index < Math.min(products.length - 1, 4) && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
