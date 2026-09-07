import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { logService } from "../api/logService";
import type { SystemLog, AuditFiltersState, AuditStats } from "../model/audit.types";
import { getActionMetadata } from "../utils/logFormatter";

const INITIAL_FILTERS: AuditFiltersState = {
  search: "",
  user: "ALL",
  role: "ALL",
  level: "ALL",
  category: "ALL",
  startDate: "",
  endDate: "",
};

function parseDateBoundary(dateStr: string, isEndOfDay: boolean): number | null {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();

  let year: number;
  let month: number;
  let day: number;

  if (trimmed.includes("-")) {
    const parts = trimmed.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    [year, month, day] = parts;
  } else if (trimmed.includes("/")) {
    const parts = trimmed.split("/").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    [day, month, year] = parts;
  } else {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }

  const result = isEndOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  return isNaN(result.getTime()) ? null : result.getTime();
}

function getLogEpoch(ts: string | number | Date | undefined | null): number {
  if (!ts) return 0;
  if (typeof ts === "number") return ts;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function downloadAuditCsv(logs: SystemLog[], isFiltered = false) {
  const headers = ["Fecha y Hora", "Usuario", "Rol", "Accion", "Detalles", "Nivel"];
  const rows = logs.map((log) => [
    format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
    log.user,
    log.role || "N/A",
    log.action,
    `"${(log.details || "").replace(/"/g, '""')}"`,
    log.level.toUpperCase(),
  ]);
  const content = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const suffix = isFiltered ? "_filtrada" : "";
  link.download = `bitacora_auditoria${suffix}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useAuditLog() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFiltersState>(INITIAL_FILTERS);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logService.getLogs(500);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateFilter = useCallback(
    <K extends keyof AuditFiltersState>(key: K, value: AuditFiltersState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const setDatePreset = useCallback((preset: "today" | "yesterday" | "7days" | "month" | "all") => {
    const now = new Date();
    if (preset === "today") {
      const todayStr = format(now, "yyyy-MM-dd");
      setFilters((prev) => ({ ...prev, startDate: todayStr, endDate: todayStr }));
    } else if (preset === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = format(yesterday, "yyyy-MM-dd");
      setFilters((prev) => ({ ...prev, startDate: yStr, endDate: yStr }));
    } else if (preset === "7days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      setFilters((prev) => ({
        ...prev,
        startDate: format(d, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      }));
    } else if (preset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters((prev) => ({
        ...prev,
        startDate: format(firstDay, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      }));
    } else if (preset === "all") {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
    }
  }, []);

  // Lista de usuarios únicos presentes en los registros cargados
  const availableUsers = useMemo(() => {
    const usersSet = new Set<string>();
    logs.forEach((log) => {
      if (log.user) usersSet.add(log.user);
    });
    return Array.from(usersSet).sort((a, b) => a.localeCompare(b));
  }, [logs]);

  // Filtrado reactivo en memoria
  const filteredLogs = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();

    const startLimit = parseDateBoundary(filters.startDate, false);
    const endLimit = parseDateBoundary(filters.endDate, true);

    return logs.filter((log) => {
      // 1. Filtro de búsqueda libre
      if (searchLower) {
        const userMatch = log.user.toLowerCase().includes(searchLower);
        const actionMatch = log.action.toLowerCase().includes(searchLower);
        const detailsMatch = (log.details || "").toLowerCase().includes(searchLower);
        const meta = getActionMetadata(log.action);
        const metaMatch =
          meta.label.toLowerCase().includes(searchLower) ||
          meta.category.toLowerCase().includes(searchLower);

        if (!userMatch && !actionMatch && !detailsMatch && !metaMatch) {
          return false;
        }
      }

      // 2. Filtro de Usuario
      if (filters.user !== "ALL" && log.user.toLowerCase() !== filters.user.toLowerCase()) {
        return false;
      }

      // 3. Filtro de Rol
      if (filters.role !== "ALL" && (log.role || "").toUpperCase() !== filters.role.toUpperCase()) {
        return false;
      }

      // 4. Filtro de Nivel
      if (filters.level !== "ALL" && log.level.toUpperCase() !== filters.level.toUpperCase()) {
        return false;
      }

      // 5. Filtro de Categoría
      if (filters.category !== "ALL") {
        const meta = getActionMetadata(log.action);
        if (meta.category !== filters.category) {
          return false;
        }
      }

      // 6. Rango de Fechas (Robusto con conversión a Epoch)
      const logEpoch = getLogEpoch(log.timestamp);
      if (logEpoch > 0) {
        if (startLimit !== null && logEpoch < startLimit) {
          return false;
        }
        if (endLimit !== null && logEpoch > endLimit) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filters]);

  // Métricas calculadas para los KPIs
  const stats = useMemo<AuditStats>(() => {
    const dataset = filteredLogs;
    let errors = 0;
    let warnings = 0;
    let logins = 0;
    let operations = 0;

    dataset.forEach((log) => {
      const lvl = log.level.toUpperCase();
      if (lvl === "ERROR") errors++;
      else if (lvl === "WARN") warnings++;

      const act = log.action.toUpperCase();
      if (act.includes("LOGIN")) logins++;
      if (
        act === "ORDER_FINALIZED" ||
        act.includes("CONFIG") ||
        act.includes("PRODUCT") ||
        act.includes("SHIFT")
      ) {
        operations++;
      }
    });

    return {
      total: dataset.length,
      errors,
      warnings,
      logins,
      operations,
    };
  }, [filteredLogs]);

  const handleViewDetails = useCallback((log: SystemLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailOpen(false);
    setSelectedLog(null);
  }, []);

  const handleExportCsv = useCallback(() => {
    const isFiltered =
      Boolean(filters.search.trim()) ||
      filters.user !== "ALL" ||
      filters.role !== "ALL" ||
      filters.level !== "ALL" ||
      filters.category !== "ALL" ||
      Boolean(filters.startDate) ||
      Boolean(filters.endDate);

    downloadAuditCsv(filteredLogs, isFiltered);
  }, [filteredLogs, filters]);

  return {
    logs: filteredLogs,
    rawLogs: logs,
    totalCount: logs.length,
    filteredCount: filteredLogs.length,
    loading,
    refresh,
    filters,
    updateFilter,
    resetFilters,
    setDatePreset,
    availableUsers,
    stats,
    selectedLog,
    detailOpen,
    handleViewDetails,
    handleCloseDetails,
    exportCsv: handleExportCsv,
  };
}
