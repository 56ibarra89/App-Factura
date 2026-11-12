import React from "react";
import { useAuth } from "../model/AuthContext";
import type { UserRole } from "../model/user.types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { role, isLoggedIn } = useAuth();

  if (!isLoggedIn || !role) {
    return <>{fallback}</>;
  }

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
