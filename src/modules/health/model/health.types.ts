export type BackendConnectionStatus = "checking" | "connected" | "disconnected";

export interface HealthState {
  status: BackendConnectionStatus;
  error: string | null;
  retryCount: number;
  lastChecked: Date | null;
}

export interface UseBackendHealthOptions {
  checkIntervalMs?: number;
  retryIntervalMs?: number;
  timeoutMs?: number;
}

export interface UseBackendHealthReturn extends HealthState {
  isChecking: boolean;
  retryConnection: () => Promise<boolean>;
}
