import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { BackButton } from "../components/BackButton";
import PageHeader from "../components/PageHeader";
import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { Order } from "../types/order.types";
import OrderViewDialog from "../components/OrderViewDialog";
import { useOrderHistory } from "../hooks/useOrderHistory";
import ConsultarFacturasFilters from "../components/consultar-facturas/ConsultarFacturasFilters";
import ConsultarFacturasTable from "../components/consultar-facturas/ConsultarFacturasTable";
import PinValidationDialog from "../components/auth/PinValidationDialog";
import { useAuth } from "../context/AuthContext";

const ConsultarFacturas = () => {

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
  const [isViewOnly, setIsViewOnly] = useState(false);

  const handlePrint = (order: Order) => {
    setIsViewOnly(false);
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

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOnly(true);
    setPreviewOpen(true);
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
        startContent={<BackButton to="/home" />}
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
        onViewClick={handleView}
      />

      {selectedOrder && (
        <OrderViewDialog
          open={previewOpen}
          onClose={handleClosePreview}
          cart={selectedOrder.items}
          subTotal={selectedOrder.subTotal || 0}
          taxAmount={selectedOrder.taxAmount || 0}
          total={selectedOrder.total}
          customerName={selectedOrder.customerName}
          customerAddress={selectedOrder.customerAddress}
          orderType={selectedOrder.orderType}
          invoiceNumber={selectedOrder.invoiceNumber || "Sin Factura"}
          cashierName={selectedOrder.cashierSnapshotName}
          title={`Factura #${selectedOrder.invoiceNumber || "Sin Factura"} - ${selectedOrder.customerName || "Cliente"}`}
          confirmText="Imprimir"
          showConfirmButton={!isViewOnly}
          onConfirm={() => {
            if (window.ipcRenderer) {
              window.ipcRenderer.send('print-silent');
              setTimeout(() => {
                handleClosePreview();
              }, 500);
            } else {
              window.print();
              handleClosePreview();
            }
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
