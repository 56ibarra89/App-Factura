import { useState, useEffect, useCallback } from "react";
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../services/config/runtimeConfigGateway";

export interface DgiConfig {
  resolutionNumber: string;
  startNumber: number;
  endNumber: number;
  authorizationDate: string;
}

const DGI_CONFIG_KEY = "dgi_resolution";

export const useDgiConfig = (
  gateway: RuntimeConfigGateway = runtimeConfigGateway,
) => {
  const [dgiConfig, setDgiConfig] = useState<DgiConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await gateway.get<DgiConfig>(DGI_CONFIG_KEY);
      if (response) {
        setDgiConfig(response);
      }
    } catch (error) {
      console.error("Error fetching DGI config:", error);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  const saveConfig = async (data: DgiConfig) => {
    try {
      await gateway.save(DGI_CONFIG_KEY, data);
      setDgiConfig(data);
    } catch (error) {
      console.error("Error saving DGI config:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { dgiConfig, loading, saveConfig };
};
