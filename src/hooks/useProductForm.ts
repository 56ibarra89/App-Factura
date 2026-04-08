import { useEffect, useState } from "react";
import { Product, ProductFormState } from "../types/product";
import { PIZZA_DEFAULTS, IS_PIZZA } from "../config/constants";
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
        setExtras(productMapper.toFormExtras(editing.product.extras));
      } else {
        setForm(productMapper.toFormState(null, ""));
        setExtras([]);
      }
    }
  }, [open, editing, setExtras]);

  const handleCategoryChange = (cat: string) => {
    const isPizzaCategory = IS_PIZZA(cat);
    setForm((prev) => ({
      ...prev,
      category: cat,
      prices: isPizzaCategory
        ? PIZZA_DEFAULTS.map((p) => ({ ...p, price: "" }))
        : [{ size: "único", price: "" }],
      singlePrice: "",
    }));

    if (!isPizzaCategory) {
      setExtras([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = productMapper.toDomainProduct(form, extras);
    onSubmit(
      form.category,
      newProduct,
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
    handleAddExtra: addExtra,
    handleRemoveExtra: removeExtra,
    handleExtraNameChange: changeExtraName,
    handleExtraPriceChange: changeExtraPrice,
    handleSubmit,
  };
}
