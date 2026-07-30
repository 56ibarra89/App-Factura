import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { logService } from "../api/logService";
import type { SystemLog } from "../model/audit.types";

function downloadAuditCsv(logs: SystemLog[]) {
  const headers = ["Fecha", "Usuario", "Rol", "Accion", "Detalles", "Nivel"];
  const rows = logs.map((log) => [
    format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
    log.user,
    log.role || "N/A",
    log.action,
    `"${(log.details || "").replace(/"/g, '""')}"`,
    log.level,
  ]);
  const content = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bitacora_auditoria_${format(new Date(), "yyyyMMdd")}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useAuditLog() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await logService.getLogs(500));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    logs,
    loading,
    refresh,
    exportCsv: () => downloadAuditCsv(logs),
  };
}
