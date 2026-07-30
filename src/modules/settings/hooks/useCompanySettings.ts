import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth";
import {
  companyConfigGateway,
  type CompanyConfigGateway,
} from "../api/companyConfigGateway";
import { logService } from "../../audit";
import {
  DEFAULT_EMPRESA_CONFIG,
  type EmpresaConfigState,
} from "../model/settings.types";

export type { EmpresaConfigState } from "../model/settings.types";

function sanitize(text: string, limit: number) {
  return text.replace(/<[^>]*>?/gm, "").substring(0, limit).trim();
}

export const useCompanySettings = (
  gateway: CompanyConfigGateway = companyConfigGateway,
) => {
  const { username, role } = useAuth();
  const [config, setConfig] = useState<EmpresaConfigState>(
    DEFAULT_EMPRESA_CONFIG,
  );

  useEffect(() => {
    let mounted = true;
    void gateway.load().then((data) => {
      if (mounted && data && Object.keys(data).length > 0) {
        setConfig((current) => ({ ...current, ...data }));
      }
    });
    return () => {
      mounted = false;
    };
  }, [gateway]);

  const updateField = useCallback(
    <K extends keyof EmpresaConfigState>(
      key: K,
      value: EmpresaConfigState[K],
    ) => {
      setConfig((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const saveConfig = useCallback(async () => {
    const sanitizedConfig: EmpresaConfigState = {
      ...config,
      businessName: sanitize(config.businessName, 100),
      address: sanitize(config.address, 200),
      phone: sanitize(config.phone, 20),
      ticketFooter: sanitize(config.ticketFooter, 300),
    };

    try {
      await gateway.save(sanitizedConfig);
      setConfig(sanitizedConfig);
      void logService.log(
        username,
        role,
        "CONFIG_CHANGE",
        `Actualización de datos de identidad de la empresa (${sanitizedConfig.businessName})`,
      );
      return true;
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      return false;
    }
  }, [config, gateway, role, username]);

  const resetConfig = useCallback(async () => {
    try {
      await gateway.save(DEFAULT_EMPRESA_CONFIG);
      setConfig(DEFAULT_EMPRESA_CONFIG);
      void logService.log(
        username,
        role,
        "CONFIG_CHANGE",
        "Identidad de la empresa restablecida a valores por defecto",
      );
      return true;
    } catch (error) {
      console.error("Error al restablecer la configuración:", error);
      return false;
    }
  }, [gateway, role, username]);

  return {
    config,
    updateField,
    saveConfig,
    resetConfig,
  };
};
