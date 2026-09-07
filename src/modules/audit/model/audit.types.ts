export type LogLevel = "info" | "warn" | "error" | "INFO" | "WARN" | "ERROR";
export type AuditLogLevel = LogLevel;

export interface SystemLog {
  id?: number;
  timestamp: string | number | Date;
  user: string;
  role: string | null;
  action: string;
  details?: string;
  level: LogLevel;
}

export interface AuditFiltersState {
  search: string;
  user: string;
  role: string;
  level: string;
  category: string;
  startDate: string;
  endDate: string;
}

export interface AuditStats {
  total: number;
  errors: number;
  warnings: number;
  logins: number;
  operations: number;
}

export interface AuditQueryParams {
  limit?: number;
  user?: string;
  role?: string;
  action?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

