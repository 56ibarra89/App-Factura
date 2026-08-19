import { useEffect, useState } from "react";
import type { Product, ProductFormState } from "../model/catalog.types";
import { productMapper } from "../model/productMapper";
import { useProductExtras } from "./useProductExtras";

interface UseProductFormArgs {
  editing: null | { product: Product; category: string };
  onSubmit: (category: string, product: Product, oldName?: string) => void;
  open: boolean;
}

export function useProductForm({ editing, onSubmit, open }: UseProductFormArgs) {
  const [dynamicSizes, setDynamicSizes] = useState<string[]>(["familiar", "mediana", "personal"]);
  const [form, setForm] = useState<ProductFormState>(
    productMapper.toFormState(null, ""),
  );

  const {
    extras,
    setExtras,
    addExtra,
    removeExtra,
    changeExtraName,
    changeExtraPrice,
  } = useProductExtras();

  useEffect(() => {
    if (open) {
      const sizes = ["familiar", "mediana", "personal"];
      setDynamicSizes(sizes);
      if (editing) {
        setForm(
          productMapper.toFormState(editing.product, editing.category),
        );
        setExtras(productMapper.toFormExtras(editing.product.extras, editing.product.hasMultipleSizes ?? false, sizes));
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
        ? dynamicSizes.map((size) => ({ size, price: "" }))
        : [{ size: "único", price: "" }],
      singlePrice: "",
    }));
    setExtras([]);
  };

  const isFormValid =
    form.name.trim() !== "" &&
    form.category !== "" &&
    (form.hasMultipleSizes
      ? form.prices.some((p) => p.price !== "" && parseFloat(p.price) > 0) &&
        form.prices.every((p) => p.price === "" || parseFloat(p.price) > 0)
      : form.singlePrice !== "" && parseFloat(form.singlePrice) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const sanitize = (text: string, limit: number) => {
      return text
        .replace(/<[^>]*>?/gm, "")
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
    dynamicSizes,
    form,
    setForm,
    extras,

    handleCategoryChange,
    handleMultipleSizesToggle,
    handleAddExtra: () => addExtra(form.hasMultipleSizes, dynamicSizes),
    handleRemoveExtra: removeExtra,
    handleExtraNameChange: changeExtraName,
    handleExtraPriceChange: changeExtraPrice,
    handleSubmit,
    isFormValid,
  };
}

