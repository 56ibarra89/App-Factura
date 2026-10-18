import {
  Alert,
  Box,
  Button,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { BackButton, ConfirmDialog, PageHeader } from "../../../shared/ui";
import CustomerFormModal from "../ui/CustomerFormModal";
import CustomerSearchBar from "../ui/admin/CustomerSearchBar";
import CustomerTable from "../ui/admin/CustomerTable";
import { useAdminCustomers } from "../hooks/useAdminCustomers";

const AdminClientes = () => {
  const customers = useAdminCustomers();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Gestión de Clientes"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            id="admin-clientes-new-btn"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={customers.openCreate}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Nuevo Cliente
          </Button>
        }
      />

      {customers.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {customers.error}
        </Alert>
      )}

      <CustomerSearchBar
        value={customers.search}
        resultCount={customers.filteredCustomers.length}
        onChange={customers.setSearch}
      />

      <CustomerTable
        customers={customers.filteredCustomers}
        loading={customers.loading}
        onEdit={customers.openEdit}
        onDelete={customers.requestDelete}
      />

      <CustomerFormModal
        open={customers.modalOpen}
        customer={customers.editingCustomer}
        onClose={customers.closeModal}
        onSave={customers.save}
        addPhone={customers.addPhone}
        removePhone={customers.removePhone}
        setDefaultPhone={customers.setDefaultPhone}
        addAddress={customers.addAddress}
        removeAddress={customers.removeAddress}
        setDefaultAddress={customers.setDefaultAddress}
      />

      <ConfirmDialog
        open={Boolean(customers.pendingDelete)}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={customers.confirmDelete}
        onClose={customers.cancelDelete}
      />

      <Snackbar
        open={customers.notification.open}
        autoHideDuration={3500}
        onClose={customers.closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={customers.notification.severity}
          variant="filled"
          onClose={customers.closeNotification}
        >
          {customers.notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminClientes;
