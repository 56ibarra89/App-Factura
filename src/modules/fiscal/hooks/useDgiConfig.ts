import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  dgiConfigGateway,
  type DgiConfigGateway,
} from "../api/dgiConfigGateway";
import type { DgiConfig } from "../model/fiscal.types";

export const useDgiConfig = (
  gateway: DgiConfigGateway = dgiConfigGateway,
) => {
  const [dgiConfig, setDgiConfig] = useState<DgiConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const config = await gateway.load();
      if (config) setDgiConfig(config);
    } catch (error) {
      console.error("Error fetching DGI config:", error);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  const saveConfig = async (config: DgiConfig) => {
    await gateway.save(config);
    setDgiConfig(config);
  };

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  return { dgiConfig, loading, saveConfig };
};
