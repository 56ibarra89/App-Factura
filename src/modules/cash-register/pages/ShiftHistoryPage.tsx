import { useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Tooltip, Alert } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useShiftHistory } from "../hooks/useShiftHistory";
import { useAuth, type UserRole } from "../../auth";
import ShiftTicketPrint from "../ui/ShiftTicketPrint";
import { receiptPrinter } from "../../../shared/printing";
import type { Shift, CashDenominationCount } from "../model/cash-register.types";
import { ShiftHistoryFilters } from "../ui/ShiftHistoryFilters";
import { ShiftHistoryTable } from "../ui/ShiftHistoryTable";
import { ShiftDetailDialog } from "../ui/ShiftDetailDialog";
import { ShiftDenominationViewDialog } from "../ui/ShiftDenominationViewDialog";

export default function ShiftHistoryPage() {
  const navigate = useNavigate();
  const { role: userRole } = useAuth();
  const { shifts, users, loading, error, reload } = useShiftHistory();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [modalidadFilter, setModalidadFilter] = useState<string>("all");
  const [cuadreFilter, setCuadreFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modales
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [viewingDenominations, setViewingDenominations] = useState<
    CashDenominationCount[] | null
  >(null);
  const [printShift, setPrintShift] = useState<Shift | null>(null);

  const getUserInfo = useCallback(
    (cashierName: string) => {
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === cashierName.toLowerCase() ||
          `${u.firstName} ${u.lastName}`.trim().toLowerCase() ===
            cashierName.toLowerCase(),
      );

      const fullName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : null;
      const role: UserRole | undefined = user?.role;

      return { user, fullName, role };
    },
    [users],
  );

  // Filtrado de turnos
  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const { fullName, role } = getUserInfo(shift.cashierName);
      const isClosed = shift.status === "closed";
      const totalDiff = shift.totalDifference ?? shift.cashDifference ?? 0;
      const hasDiscrepancy = isClosed && Math.abs(totalDiff) >= 0.01;

      // Filtro por Modalidad (Relevo vs Cierre Final vs En Curso)
      if (modalidadFilter === "HANDOVER" && shift.closeType !== "HANDOVER") {
        return false;
      }
      if (modalidadFilter === "END_OF_DAY" && shift.closeType !== "END_OF_DAY") {
        return false;
      }
      if (modalidadFilter === "OPEN" && shift.status !== "open") {
        return false;
      }

      // Filtro por Estado de Cuadre
      if (cuadreFilter === "balanced" && (!isClosed || hasDiscrepancy)) {
        return false;
      }
      if (cuadreFilter === "discrepant" && (!isClosed || !hasDiscrepancy)) {
        return false;
      }
      if (
        cuadreFilter === "authorized" &&
        (!shift.authorizedByName && !shift.authorizedById)
      ) {
        return false;
      }

      // Filtro por Rol
      if (roleFilter !== "all" && role !== roleFilter) {
        return false;
      }

      // Búsqueda por Texto
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const matchUsername = shift.cashierName.toLowerCase().includes(query);
        const matchFullName = fullName
          ? fullName.toLowerCase().includes(query)
          : false;
        const matchRegister = shift.cashRegisterName
          ? shift.cashRegisterName.toLowerCase().includes(query)
          : false;
        const matchNotes = shift.notes
          ? shift.notes.toLowerCase().includes(query)
          : false;
        const matchAuthorizer = shift.authorizedByName
          ? shift.authorizedByName.toLowerCase().includes(query)
          : false;
        const matchReason = shift.discrepancyReason
          ? shift.discrepancyReason.toLowerCase().includes(query)
          : false;

        if (
          !matchUsername &&
          !matchFullName &&
          !matchRegister &&
          !matchNotes &&
          !matchAuthorizer &&
          !matchReason
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    shifts,
    modalidadFilter,
    cuadreFilter,
    roleFilter,
    searchTerm,
    getUserInfo,
  ]);

  // Cálculos de Resumen
  const summaryMetrics = useMemo(() => {
    let totalSales = 0;
    let netDifference = 0;
    let closedCount = 0;

    for (const s of filteredShifts) {
      totalSales += s.totalSales.total || 0;
      if (s.status === "closed") {
        closedCount++;
        netDifference += s.totalDifference ?? s.cashDifference ?? 0;
      }
    }

    return { totalSales, netDifference, closedCount };
  }, [filteredShifts]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    modalidadFilter !== "all" ||
    cuadreFilter !== "all" ||
    roleFilter !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    setModalidadFilter("all");
    setCuadreFilter("all");
    setRoleFilter("all");
    setPage(0);
  };

  const handleDirectPrint = async (shift: Shift) => {
    setPrintShift(shift);
    try {
      await receiptPrinter.print({ renderDelayMs: 400, settleDelayMs: 800 });
    } catch {
      window.print();
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        p: { xs: 2, md: 4 },
      }}
    >
      <PageHeader
        title="Historial de Turnos y Relevos"
        startContent={<BackButton to="/home" />}
        actions={
          <Tooltip title="Actualizar historial">
            <IconButton
              onClick={reload}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <RefreshIcon color="primary" />
            </IconButton>
          </Tooltip>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* FILTROS DE HISTORIAL (ui/ShiftHistoryFilters) */}
      <ShiftHistoryFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(0);
        }}
        modalidadFilter={modalidadFilter}
        onModalidadChange={(val) => {
          setModalidadFilter(val);
          setPage(0);
        }}
        cuadreFilter={cuadreFilter}
        onCuadreChange={(val) => {
          setCuadreFilter(val);
          setPage(0);
        }}
        roleFilter={roleFilter}
        onRoleChange={(val) => {
          setRoleFilter(val);
          setPage(0);
        }}
        totalFiltered={filteredShifts.length}
        totalSales={summaryMetrics.totalSales}
        netDifference={summaryMetrics.netDifference}
        hasClosedShifts={summaryMetrics.closedCount > 0}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* TABLA PRINCIPAL DE TURNOS (ui/ShiftHistoryTable) */}
      <ShiftHistoryTable
        shifts={filteredShifts}
        loading={loading}
        users={users}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
        onSelectShift={setSelectedShift}
        onDirectPrint={handleDirectPrint}
        onAdminCloseShift={() => navigate("/cerrar-caja")}
        userRole={userRole}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* MODAL DETALLE ESTILO CIERRE DE CAJA (ui/ShiftDetailDialog) */}
      <ShiftDetailDialog
        shift={selectedShift}
        onClose={() => setSelectedShift(null)}
        onPrint={handleDirectPrint}
        onOpenDenominations={setViewingDenominations}
      />

      {/* DIÁLOGO CONTEO DENOMINACIONES (ui/ShiftDenominationViewDialog) */}
      <ShiftDenominationViewDialog
        open={Boolean(viewingDenominations)}
        onClose={() => setViewingDenominations(null)}
        denominations={viewingDenominations}
      />

      {/* TICKET OCULTO PARA IMPRESIÓN FÍSICA DIRECTA */}
      {printShift && <ShiftTicketPrint shift={printShift} />}
    </Box>
  );
}
