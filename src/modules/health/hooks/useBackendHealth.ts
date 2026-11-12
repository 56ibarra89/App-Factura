import { useState, useEffect, useCallback, useRef } from "react";
import { checkBackendHealthApi } from "../api/healthApi";
import type {
  HealthState,
  UseBackendHealthOptions,
  UseBackendHealthReturn,
} from "../model/health.types";

export const useBackendHealth = (
  options: UseBackendHealthOptions = {},
): UseBackendHealthReturn => {
  const { retryIntervalMs = 4000, timeoutMs = 4000 } = options;

  const [state, setState] = useState<HealthState>({
    status: "checking",
    error: null,
    retryCount: 0,
    lastChecked: null,
  });

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const isOk = await checkBackendHealthApi(timeoutMs);

    if (!isMountedRef.current) return isOk;

    if (isOk) {
      setState({
        status: "connected",
        error: null,
        retryCount: 0,
        lastChecked: new Date(),
      });
    } else {
      setState((prev) => ({
        status: "disconnected",
        error: "El servidor backend no está respondiendo o no está disponible.",
        retryCount: prev.retryCount + 1,
        lastChecked: new Date(),
      }));
    }

    setIsChecking(false);
    return isOk;
  }, [timeoutMs]);

  useEffect(() => {
    isMountedRef.current = true;
    checkHealth();

    return () => {
      isMountedRef.current = false;
    };
  }, [checkHealth]);

  useEffect(() => {
    if (state.status !== "disconnected") return;

    const timer = setInterval(() => {
      checkHealth();
    }, retryIntervalMs);

    return () => clearInterval(timer);
  }, [state.status, retryIntervalMs, checkHealth]);

  return {
    ...state,
    isChecking,
    retryConnection: checkHealth,
  };
};
