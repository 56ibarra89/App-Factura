import { Box, Typography } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import { InvoiceCancellationDialogs } from "../ui/InvoiceCancellationDialogs";
import { InvoiceCancellationFilters } from "../ui/InvoiceCancellationFilters";
import { InvoiceCancellationTable } from "../ui/InvoiceCancellationTable";
import { useInvoiceCancellation } from "../hooks/useInvoiceCancellation";
import { useMesasConfig } from "../../tables";

const CancelInvoicePage = () => {
  const cancellation = useInvoiceCancellation();
  const { floorsConfig } = useMesasConfig();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Anular Facturas"
        startContent={<BackButton to="/home" />}
      />

      <Typography
        variant="body1"
        color="text.secondary"
        mb={2}
        mt={2}
      >
        Aquí puedes consultar el registro histórico y anular
        una factura si hubo algún error. Esta acción requiere
        un PIN de administrador.
      </Typography>

      <InvoiceCancellationFilters
        startDate={cancellation.startDate}
        endDate={cancellation.endDate}
        searchQuery={cancellation.searchQuery}
        onStartDateChange={cancellation.setStartDate}
        onEndDateChange={cancellation.setEndDate}
        onSearchChange={cancellation.setSearchQuery}
        onRefresh={cancellation.refresh}
      />

      <InvoiceCancellationTable
        orders={cancellation.paginatedOrders}
        totalRows={cancellation.filteredCount}
        loading={cancellation.loading}
        searchQuery={cancellation.searchQuery}
        page={cancellation.page}
        rowsPerPage={cancellation.rowsPerPage}
        floors={floorsConfig}
        onRequestCancellation={
          cancellation.requestCancellation
        }
        onPageChange={cancellation.changePage}
        onRowsPerPageChange={
          cancellation.changeRowsPerPage
        }
      />

      <InvoiceCancellationDialogs
        reasonOpen={cancellation.dialogs.reasonOpen}
        pinOpen={cancellation.dialogs.pinOpen}
        reason={cancellation.dialogs.reason}
        onReasonChange={cancellation.dialogs.setReason}
        onCloseReason={cancellation.dialogs.closeReason}
        onSubmitReason={cancellation.dialogs.submitReason}
        onClosePin={cancellation.dialogs.closePin}
        onConfirm={cancellation.dialogs.confirm}
      />
    </Box>
  );
};

export default CancelInvoicePage;
