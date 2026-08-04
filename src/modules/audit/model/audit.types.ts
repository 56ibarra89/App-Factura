export type LogLevel = "info" | "warn" | "error" | "INFO" | "WARN" | "ERROR";
export type AuditLogLevel = LogLevel;

export interface SystemLog {
  id?: number;
  timestamp: number;
  user: string;
  role: string | null;
  action: string;
  details?: string;
  level: LogLevel;
}
