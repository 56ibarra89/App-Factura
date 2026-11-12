import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { logService } from "../../audit";
import { useAuth } from "../../auth";
import {
  taxConfigGateway,
  type TaxConfigGateway,
} from "../api/taxConfigGateway";
import type {
  Tax,
  TaxConfig,
} from "../model/settings.types";
import { taxConfigStore } from "../model/taxConfigStore";

export const useTaxConfig = (
  gateway: TaxConfigGateway = taxConfigGateway,
) => {
  const { username, role } = useAuth();
  const config = useSyncExternalStore(
    taxConfigStore.subscribe,
    taxConfigStore.getSnapshot,
    taxConfigStore.getSnapshot,
  );

  useEffect(() => {
    void taxConfigStore
      .ensureLoaded(() => gateway.load())
      .catch((error) =>
        console.error("Error loading tax config:", error),
      );
  }, [gateway]);

  const setConfigAndSave = useCallback(
    (update: TaxConfig | ((current: TaxConfig) => TaxConfig)) => {
      const current = taxConfigStore.getSnapshot();
      const next =
        typeof update === "function" ? update(current) : update;

      taxConfigStore.set(next);
      void gateway
        .save(next)
        .catch((error) =>
          console.error("Error saving tax config:", error),
        );
    },
    [gateway],
  );

  const toggleExoneration = useCallback(() => {
    setConfigAndSave((current) => {
      const isExonerated = !current.isExonerated;
      logService.log(
        username,
        role,
        "CONFIG_CHANGE",
        `Exoneración de impuestos ${
          isExonerated ? "ACTIVADA" : "DESACTIVADA"
        }`,
      );
      return { ...current, isExonerated };
    });
  }, [role, setConfigAndSave, username]);

  const updateTaxRate = useCallback(
    (id: string, newPercentage: number) => {
      setConfigAndSave((current) => {
        const tax = current.taxes.find(
          (candidate: Tax) => candidate.id === id,
        );
        if (tax) {
          logService.log(
            username,
            role,
            "CONFIG_CHANGE",
            `Cambio de tasa de '${tax.name}' a ${newPercentage}%`,
          );
        }

        return {
          ...current,
          taxes: current.taxes.map((candidate) =>
            candidate.id === id
              ? { ...candidate, percentage: newPercentage }
              : candidate,
          ),
        };
      });
    },
    [role, setConfigAndSave, username],
  );

  return {
    taxes: config.taxes,
    isExonerated: config.isExonerated,
    toggleExoneration,
    updateTaxRate,
  };
};
