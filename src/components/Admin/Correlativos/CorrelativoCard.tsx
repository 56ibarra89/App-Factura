import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Correlativo } from "../../../types/correlativo.types";

interface CorrelativoCardProps {
  activeFactura?: Correlativo;
}

const CorrelativoCard: React.FC<CorrelativoCardProps> = ({ activeFactura }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 5 }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 2,
            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            border: "1px solid #90caf9",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <ReceiptLongIcon sx={{ color: "#1976d2", mr: 1 }} />
              <Typography variant="h6" color="primary.dark" fontWeight={600}>
                Secuencia Activa (Factura)
              </Typography>
            </Box>
            {activeFactura ? (
              <>
                <Typography variant="h4" fontWeight={700} color="#0d47a1" gutterBottom>
                  {activeFactura.prefix}{activeFactura.currentNumber.toString().padStart(8, "0")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolución DGI: {activeFactura.resolutionNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rango: {activeFactura.startNumber} al {activeFactura.endNumber}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No hay una secuencia de factura activa.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CorrelativoCard;
