import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { CompanyConfigGateway } from "../services/config/companyConfigGateway";
import { useEmpresaConfig } from "./useEmpresaConfig";

export function useAdminCompanyIdentity(gateway?: CompanyConfigGateway) {
  const companyConfig = useEmpresaConfig(gateway);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setLoading(true);
    try {
      const saved = await companyConfig.saveConfig();
      if (saved) {
        setToastMessage("¡Identidad de la empresa actualizada con éxito!");
        setToastOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const reset = await companyConfig.resetConfig();
      if (reset) {
        setToastMessage(
          "¡Configuración eliminada y restablecida con éxito!",
        );
        setToastOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        companyConfig.updateField("logoUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return {
    ...companyConfig,
    loading,
    toastMessage,
    toastOpen,
    confirmOpen,
    fileInputRef,
    save,
    uploadLogo,
    removeLogo: () => companyConfig.updateField("logoUrl", ""),
    requestReset: () => setConfirmOpen(true),
    cancelReset: () => setConfirmOpen(false),
    confirmReset,
    closeToast: () => setToastOpen(false),
  };
}
