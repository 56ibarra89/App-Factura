import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuditLogPage } from "../../modules/audit";
import { PERMISSIONS, PinValidationDialog } from "../../modules/auth";

export default function AuditLogRoutePage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  return (
    <>
      {authorized && <AuditLogPage />}
      <PinValidationDialog
        open={!authorized}
        onClose={() => navigate("/admin")}
        onSuccess={() => setAuthorized(true)}
        title="Acceso protegido a Bitácora"
        requiredPermission={PERMISSIONS.AUDIT_READ}
      />
    </>
  );
}
