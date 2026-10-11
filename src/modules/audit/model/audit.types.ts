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
  module?: string;
  operation?: string;
  entity?: string;
  entityId?: string;
  source?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  route?: string;
  statusCode?: number;
  success?: boolean;
  durationMs?: number;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}

export interface AuditFiltersState {
  search: string;
  user: string;
  role: string;
  level: string;
  category: string;
  module: string;
  result: string;
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
  module?: string;
  operation?: string;
  success?: boolean;
}
