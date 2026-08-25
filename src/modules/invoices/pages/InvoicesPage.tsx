import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import type { Invoice } from "../model/invoice.types";
import InvoiceDetailsDialog from "../ui/InvoiceDetailsDialog";
import { useInvoiceHistory } from "../hooks/useInvoiceHistory";
import InvoiceFilters from "../ui/InvoiceFilters";
import InvoiceTable from "../ui/InvoiceTable";
import {
  PinValidationDialog,
  useAuth,
} from "../../auth";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";

interface InvoicesPageProps {
  printer?: ReceiptPrinter;
}

const InvoicesPage = ({
  printer = receiptPrinter,
}: InvoicesPageProps) => {

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    loading,
    filteredOrders,
    handleSearchClick
  } = useInvoiceHistory();

  const { role } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Invoice | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const handlePrint = (order: Invoice) => {
    setIsViewOnly(false);

    if (role === "admin") {
      setSelectedOrder(order);
      setPreviewOpen(true);
    } else {

      setOrderToPrint(order);
      setPinDialogOpen(true);
    }
  };

  const handleView = (order: Invoice) => {
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

  const handleConfirmPrint = async () => {
    await printer.print({ settleDelayMs: 500 });
    handleClosePreview();
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
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
        Consulta el registro histórico de ventas. Filtra por rango de fechas, método de pago o busca por cliente/cajero/ID.
      </Typography>

      <InvoiceFilters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onSearchClick={handleSearchClick}
      />

      <InvoiceTable
        orders={filteredOrders}
        loading={loading}
        onPrintClick={handlePrint}
        onViewClick={handleView}
      />

      {selectedOrder && (
        <InvoiceDetailsDialog
          open={previewOpen}
          onClose={handleClosePreview}
          cart={selectedOrder.items}
          subTotal={selectedOrder.subTotal || 0}
          taxAmount={selectedOrder.taxAmount || 0}
          discountAmount={selectedOrder.discountAmount || 0}
          total={selectedOrder.total}
          customerName={selectedOrder.customerName}
          customerAddress={selectedOrder.customerAddress}
          orderType={selectedOrder.orderType}
          invoiceNumber={selectedOrder.invoiceNumber || "Sin Factura"}
          cashierName={selectedOrder.cashierName}
          title={`Factura #${selectedOrder.invoiceNumber || "Sin Factura"} - ${selectedOrder.customerName || "Cliente"}`}
          confirmText="Imprimir"
          showConfirmButton={!isViewOnly}
          onConfirm={handleConfirmPrint}
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

export default InvoicesPage;

