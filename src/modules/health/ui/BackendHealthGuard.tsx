import React from "react";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { ConnectingServerScreen } from "./ConnectingServerScreen";
import type { UseBackendHealthOptions } from "../model/health.types";

interface BackendHealthGuardProps {
  children: React.ReactNode;
  options?: UseBackendHealthOptions;
}

export const BackendHealthGuard: React.FC<BackendHealthGuardProps> = ({
  children,
  options,
}) => {
  const { status, retryCount, isChecking, retryConnection, error } =
    useBackendHealth(options);

  if (status !== "connected") {
    return (
      <ConnectingServerScreen
        status={status}
        retryCount={retryCount}
        isChecking={isChecking}
        onRetry={retryConnection}
        error={error}
      />
    );
  }

  return <>{children}</>;
};
