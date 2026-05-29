import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../config/apiClient";

export interface DgiConfig {
  resolutionNumber: string;
  startNumber: number;
  endNumber: number;
  authorizationDate: string;
}

export const useDgiConfig = () => {
  const [dgiConfig, setDgiConfig] = useState<DgiConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient("/config/dgi_resolution");
      if (response && response.data) {
        setDgiConfig(response.data as DgiConfig);
      }
    } catch (error) {
      console.error("Error fetching DGI config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = async (data: DgiConfig) => {
    try {
      await apiClient("/config/dgi_resolution", {
        method: "PUT",
        body: JSON.stringify({ data }),
      });
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
