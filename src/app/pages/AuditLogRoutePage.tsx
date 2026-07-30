import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuditLogPage } from "../../modules/audit";
import { PinValidationDialog } from "../../modules/auth";

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
        title="Acceso a Bitácora (Admin)"
      />
    </>
  );
}
