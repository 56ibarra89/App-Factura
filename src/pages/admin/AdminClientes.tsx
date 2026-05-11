/**
 * AdminClientes — Orquestador del módulo de gestión de clientes.
 * SRP: solo conecta el hook con los componentes UI.
 * DIP: depende de useCustomers (abstracción), nunca del repositorio directamente.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  TextField,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useCustomers } from "../../hooks/useCustomers";
import CustomerTable from "../../components/Admin/Clientes/CustomerTable";
import CustomerFormModal from "../../components/Admin/Clientes/CustomerFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Customer } from "../../types/customer.types";
import { CustomerFormData } from "../../hooks/useCustomers";

const AdminClientes: React.FC = () => {
  const {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addAddress,
    removeAddress,
  } = useCustomers();

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  // ── Filtrado por búsqueda ─────────────────────────────────────────────────────
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditing(customer);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (data: CustomerFormData) => {
    try {
      if (data.id) {
        await updateCustomer(data);
        showSnackbar("Cliente actualizado correctamente.", "success");
      } else {
        await createCustomer(data);
        showSnackbar("Cliente creado correctamente.", "success");
      }
    } catch (err) {
      showSnackbar("Error al guardar el cliente.", "error");
      throw err; // Re-lanzar para que el modal muestre el error inline
    }
  };

  const handleDeleteRequest = (id: string) => {
    setPendingDelete(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCustomer(pendingDelete);
      showSnackbar("Cliente eliminado.", "success");
    } catch {
      showSnackbar("Error al eliminar el cliente.", "error");
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const showSnackbar = (msg: string, severity: "success" | "error") => {
    setSnackbar({ open: true, msg, severity });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1100px", margin: "0 auto" }}>

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BackButton 
            id="admin-clientes-back-btn"
            to="/admin"
            sx={{ mr: 0 }}
          />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <PeopleAltIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" fontWeight={700}>
                Gestión de Clientes
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Consulta, crea, edita y elimina la información de tus clientes registrados.
            </Typography>
          </Box>
        </Box>

        <Button
          id="admin-clientes-new-btn"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1, alignSelf: "center" }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* ─── ALERTA DE ERROR ─────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ─── BARRA DE BÚSQUEDA + CONTADOR ───────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 1,
          flexWrap: "wrap",
        }}
      >
        <TextField
          id="admin-clientes-search"
          size="small"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Chip
          label={`${filtered.length} cliente${filtered.length !== 1 ? "s" : ""}`}
          variant="outlined"
          color="primary"
          size="small"
        />
      </Box>

      {/* ─── TABLA ──────────────────────────────────────────────────────────── */}
      <CustomerTable
        customers={filtered}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRequest}
      />

      {/* ─── MODAL CREAR / EDITAR ────────────────────────────────────────────── */}
      <CustomerFormModal
        open={modalOpen}
        customer={editing}
        onClose={handleCloseModal}
        onSave={handleSave}
        addAddress={addAddress}
        removeAddress={removeAddress}
      />

      {/* ─── CONFIRM ELIMINAR ────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />

      {/* ─── SNACKBAR ────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminClientes;
