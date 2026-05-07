export type LogLevel = "info" | "warn" | "error";

export interface SystemLog {
  id?: number;
  timestamp: number;
  user: string;
  role: string | null;
  action: string;
  details?: string;
  level: LogLevel;
}
