import { useCallback, useEffect, useState } from "react";
import {
  packagingConfigGateway,
  type PackagingConfigGateway,
} from "../services/config/packagingConfigGateway";
import { DEFAULT_PACKAGING_SIZES } from "../types/config";
import type { PackagingSizeConfig } from "../types/product";

interface PackagingNotification {
  open: boolean;
  msg: string;
  severity: "success" | "error";
}

const createDefaultSizes = () =>
  DEFAULT_PACKAGING_SIZES.map((size) => ({ ...size }));

export function usePackagingSizesConfig(
  open: boolean,
  onClose: () => void,
  gateway: PackagingConfigGateway = packagingConfigGateway,
) {
  const [sizes, setSizes] =
    useState<PackagingSizeConfig[]>(createDefaultSizes);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<PackagingNotification>({
    open: false,
    msg: "",
    severity: "success",
  });

  const loadSizes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gateway.load();
      setSizes(data?.length ? data : createDefaultSizes());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    if (open) void loadSizes();
  }, [loadSizes, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalSizes = sizes
        .map((size) => ({
          name: size.name.trim(),
          price: Number(size.price) || 0,
        }))
        .filter((size) => size.name !== "");

      if (finalSizes.length === 0) {
        setSnackbar({
          open: true,
          msg: "Debe haber al menos un empaque.",
          severity: "error",
        });
        return;
      }

      await gateway.save(finalSizes);
      setSnackbar({
        open: true,
        msg: "Empaques guardados correctamente.",
        severity: "success",
      });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch {
      setSnackbar({
        open: true,
        msg: "Error al guardar los empaques.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const closeSnackbar = () =>
    setSnackbar((current) => ({ ...current, open: false }));

  const handleChangeName = (index: number, name: string) => {
    setSizes((current) =>
      current.map((size, currentIndex) =>
        currentIndex === index ? { ...size, name } : size,
      ),
    );
  };

  const handleChangePrice = (index: number, price: string | number) => {
    setSizes((current) =>
      current.map((size, currentIndex) =>
        currentIndex === index
          ? { ...size, price: price as number }
          : size,
      ),
    );
  };

  const handleAdd = () => {
    setSizes((current) => [...current, { name: "", price: 0 }]);
  };

  const handleRemove = (index: number) => {
    setSizes((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  return {
    sizes,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    handleSave,
    handleChangeName,
    handleChangePrice,
    handleAdd,
    handleRemove,
  };
}
