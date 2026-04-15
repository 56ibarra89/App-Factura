import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Componente que protege elementos de la UI según el rol del usuario.
 * Sigue el principio ISO 27001 de Mínimo Privilegio (A.9.2.3)
 */
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
