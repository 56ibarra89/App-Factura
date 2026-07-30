import type { PropsWithChildren } from "react";
import { UserDirectoryProvider } from "../../modules/accounts";
import { AuthProvider } from "../../modules/auth";
import { CatalogProvider } from "../../modules/catalog";
import { OrderProvider } from "../../modules/orders";
import { ErrorBoundary } from "../../shared/ui";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
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
