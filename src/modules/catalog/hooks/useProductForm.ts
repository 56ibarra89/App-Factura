import { useEffect, useState } from "react";
import type { Product, ProductFormState } from "../model/catalog.types";
import { productMapper } from "../model/productMapper";

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

  useEffect(() => {
    if (open) {
      const sizes = ["familiar", "mediana", "personal"];
      setDynamicSizes(sizes);
      if (editing) {
        setForm(
          productMapper.toFormState(editing.product, editing.category),
        );
      } else {
        setForm(productMapper.toFormState(null, ""));
      }
    }
  }, [open, editing]);

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
      ...productMapper.toDomainProduct(form),
      id: editing?.product.id,
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
    handleCategoryChange,
    handleMultipleSizesToggle,
    handleSubmit,
    isFormValid,
  };
}
