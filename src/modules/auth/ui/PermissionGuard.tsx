import type { ReactNode } from "react";
import { useAuth } from "../model/AuthContext";
import type { PermissionCode } from "../model/permission.types";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: PermissionCode[];
  matchAny?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  permissions,
  matchAny = false,
  fallback = null,
}: PermissionGuardProps) {
  const { isLoggedIn, hasPermission } = useAuth();
  if (!isLoggedIn) return <>{fallback}</>;

  const allowed = matchAny
    ? permissions.some((permission) => hasPermission(permission))
    : hasPermission(...permissions);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
