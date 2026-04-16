import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageHeader from "../components/PageHeader";
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../theme/loginTheme";
import { Order } from "../types/order.types";
import { useNavigate } from "react-router-dom";
import OrderViewDialog from "../components/OrderViewDialog";
import { useOrderHistory } from "../hooks/useOrderHistory";
import ConsultarFacturasFilters from "../components/consultar-facturas/ConsultarFacturasFilters";
import ConsultarFacturasTable from "../components/consultar-facturas/ConsultarFacturasTable";
import PinValidationDialog from "../components/auth/PinValidationDialog";
import { useAuth } from "../context/AuthContext";

const ConsultarFacturas = () => {
  const navigate = useNavigate();

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    loading,
    filteredOrders,
    handleSearchClick
  } = useOrderHistory();

  const { role } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  const handlePrint = (order: Order) => {
    // Si es admin, mostramos el diálogo de previsualización directamente
    if (role === "admin") {
      setSelectedOrder(order);
      setPreviewOpen(true);
    } else {
      // Si no es admin, pedimos autorización por PIN
      setOrderToPrint(order);
      setPinDialogOpen(true);
    }
  };

  const handlePinSuccess = () => {
    if (orderToPrint) {
      setSelectedOrder(orderToPrint);
      setPreviewOpen(true);
    }
    setPinDialogOpen(false);
    setOrderToPrint(null);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Consultar Facturas"
        actions={
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/home")}
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
              borderRadius: 2,
              px: 2,
            }}
          >
            Regresar al Inicio
          </Button>
        }
      />

      <Typography variant="body1" color="text.secondary" mb={3} mt={2}>
        Consulta el registro histórico de ventas. Filtra por rango de fechas o
        busca por nombre de cliente/ID.
      </Typography>

      <ConsultarFacturasFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchClick={handleSearchClick}
      />

      <ConsultarFacturasTable
        orders={filteredOrders}
        loading={loading}
        onPrintClick={handlePrint}
      />

      {selectedOrder && (
        <OrderViewDialog
          open={previewOpen}
          onClose={handleClosePreview}
          cart={selectedOrder.items}
          total={selectedOrder.total}
          title={`Factura #${selectedOrder.id.split("-")[1]} - ${selectedOrder.customerName || "Cliente"}`}
          confirmText="Imprimir"
          onConfirm={() => {
            window.print();
            handleClosePreview();
          }}
        />
      )}

      {/* Security Dialog for Reprinting */}
      <PinValidationDialog
        open={pinDialogOpen}
        onClose={() => {
          setPinDialogOpen(false);
          setOrderToPrint(null);
        }}
        onSuccess={handlePinSuccess}
        title="Autorización de Reimpresión"
      />
    </Box>
  );
};

export default ConsultarFacturas;
