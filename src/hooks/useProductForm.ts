import { useEffect, useState } from "react";
import { Product, ProductFormState } from "../types/product";
import { PIZZA_DEFAULTS } from "../config/constants";
import { productMapper } from "../services/productMapper";
import { useProductExtras } from "./useProductExtras";

interface UseProductFormArgs {
  editing: null | { product: Product; category: string };
  onSubmit: (category: string, product: Product, oldName?: string) => void;
  open: boolean;
}

export function useProductForm({ editing, onSubmit, open }: UseProductFormArgs) {
  const [form, setForm] = useState<ProductFormState>(productMapper.toFormState(null, ""));

  const {
    extras,
    setExtras,
    addExtra,
    removeExtra,
    changeExtraName,
    changeExtraPrice,
  } = useProductExtras();

  // Handle initial form load for editing
  useEffect(() => {
    if (open) {
      if (editing) {
        setForm(productMapper.toFormState(editing.product, editing.category));
        setExtras(productMapper.toFormExtras(editing.product.extras, editing.product.hasMultipleSizes ?? false));
      } else {
        setForm(productMapper.toFormState(null, ""));
        setExtras([]);
      }
    }
  }, [open, editing, setExtras]);

  const handleCategoryChange = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      category: cat,
    }));
  };

  const handleMultipleSizesToggle = (hasMultiple: boolean) => {
    setForm((prev) => ({
      ...prev,
      hasMultipleSizes: hasMultiple,
      prices: hasMultiple
        ? PIZZA_DEFAULTS.map((p) => ({ ...p, price: "" }))
        : [{ size: "único", price: "" }],
      singlePrice: "",
    }));
    setExtras([]);
  };

  const isFormValid =
    form.name.trim() !== "" &&
    form.category !== "" &&
    (form.hasMultipleSizes
      ? form.prices.every((p) => p.price !== "" && parseFloat(p.price) > 0)
      : form.singlePrice !== "" && parseFloat(form.singlePrice) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Sanitización proactiva (ISO 27001 A.12.2.1)
    const sanitize = (text: string, limit: number) => {
      return text
        .replace(/<[^>]*>?/gm, "") // Remover etiquetas HTML
        .substring(0, limit)
        .trim();
    };

    const sanitizedProduct = {
      ...productMapper.toDomainProduct(form, extras),
      name: sanitize(form.name, 100),
      description: sanitize(form.description, 300)
    };

    onSubmit(
      form.category,
      sanitizedProduct,
      editing ? editing.product.name : undefined
    );
  };

  return {
    // Form and extras state
    form,
    setForm,
    extras,

    // Category and extra actions
    handleCategoryChange,
    handleMultipleSizesToggle,
    handleAddExtra: () => addExtra(form.hasMultipleSizes),
    handleRemoveExtra: removeExtra,
    handleExtraNameChange: changeExtraName,
    handleExtraPriceChange: changeExtraPrice,
    handleSubmit,
    isFormValid,
  };
}
