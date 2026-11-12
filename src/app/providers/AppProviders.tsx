import type { PropsWithChildren } from "react";
import { UserDirectoryProvider } from "../../modules/accounts";
import { AuthProvider } from "../../modules/auth";
import { CatalogProvider } from "../../modules/catalog";
import { OrderProvider } from "../../modules/orders";
import { logService } from "../../modules/audit";
import { ErrorBoundary } from "../../shared/ui";

export function AppProviders({ children }: PropsWithChildren) {
  const handleAppError = (error: Error) => {
    logService.log(
      "system",
      "critical_error",
      "APP_CRASH",
      `Fallo crítico de aplicación: ${error.message}. Stack trace capturado en consola.`,
      "error",
    );
  };

  return (
    <ErrorBoundary onError={handleAppError}>
      <AuthProvider>
        <UserDirectoryProvider>
          <CatalogProvider>
            <OrderProvider>{children}</OrderProvider>
          </CatalogProvider>
        </UserDirectoryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
