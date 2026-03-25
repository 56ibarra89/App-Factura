import { useEffect, useState } from "react";
import { Product, ProductSize } from "../types/product";
import { ExtraIngredientDef } from "../types/extras";

const pizzaSizes: ProductSize[] = ["familiar", "mediana", "personal"];

const pizzaDefaults = [
  { size: "familiar", price: "" },
  { size: "mediana", price: "" },
  { size: "personal", price: "" },
];

export const isPizza = (cat: string) => cat === "Pizzas";

export interface ExtraFormItem {
  name: string;
  prices: { size: string; price: string }[];
}

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  prices: { size: string; price: string }[];
  singlePrice: string;
}

const emptyExtra = (): ExtraFormItem => ({
  name: "",
  prices: pizzaSizes.map((s) => ({ size: s, price: "" })),
});

export const categoriesList = [
  "Pizzas",
  "Mexicanos",
  "Submarinos",
  "Alitas",
  "Postres",
  "Bebidas",
];

interface UseProductFormArgs {
  editing: null | { product: Product; category: string };
  onSubmit: (category: string, product: Product, oldName?: string) => void;
}

export function useProductForm({ editing, onSubmit }: UseProductFormArgs) {
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    category: "",
    prices: pizzaDefaults,
    singlePrice: "",
  });

  const [extras, setExtras] = useState<ExtraFormItem[]>([]);

  useEffect(() => {
    if (editing) {
      const { product, category } = editing;
      setForm({
        name: product.name,
        description: product.description || "",
        category,
        prices: isPizza(category)
          ? product.prices.map((p) => ({
              size: p.size,
              price: p.price.toString(),
            }))
          : [{ size: "único", price: product.prices[0].price.toString() }],
        singlePrice: isPizza(category)
          ? ""
          : product.prices[0].price.toString(),
      });

      if (product.extras?.length) {
        setExtras(
          product.extras.map((ext) => ({
            name: ext.name,
            prices: pizzaSizes.map((s) => {
              const found = ext.prices.find((p) => p.size === s);
              return { size: s, price: found ? found.price.toString() : "" };
            }),
          }))
        );
      } else {
        setExtras([]);
      }
    } else {
      setForm({
        name: "",
        description: "",
        category: "",
        prices: pizzaDefaults.map((p) => ({ ...p })),
        singlePrice: "",
      });
      setExtras([]);
    }
  }, [editing]);

  const handleCategoryChange = (cat: string) => {
    setForm({
      ...form,
      category: cat,
      prices: isPizza(cat)
        ? pizzaDefaults.map((p) => ({ ...p, price: "" }))
        : [{ size: "único", price: "" }],
      singlePrice: "",
    });
    if (!isPizza(cat)) {
      setExtras([]);
    }
  };

  const handleAddExtra = () => setExtras((prev) => [...prev, emptyExtra()]);

  const handleRemoveExtra = (index: number) =>
    setExtras((prev) => prev.filter((_, i) => i !== index));

  const handleExtraNameChange = (index: number, name: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  };

  const handleExtraPriceChange = (extraIndex: number, sizeIndex: number, price: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      const prices = [...updated[extraIndex].prices];
      prices[sizeIndex] = { ...prices[sizeIndex], price };
      updated[extraIndex] = { ...updated[extraIndex], prices };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productExtras: ExtraIngredientDef[] = isPizza(form.category)
      ? extras
          .filter((ext) => ext.name.trim() !== "")
          .map((ext) => ({
            name: ext.name.trim(),
            prices: ext.prices
              .filter((p) => p.price !== "" && parseFloat(p.price) > 0)
              .map((p) => ({
                size: p.size as ProductSize,
                price: parseFloat(p.price),
              })),
          }))
          .filter((ext) => ext.prices.length > 0)
      : [];

    const newProduct: Product = {
      name: form.name,
      description: form.description.trim() || undefined,
      prices: isPizza(form.category)
        ? form.prices.map((p) => ({
            size: p.size as ProductSize,
            price: parseFloat(p.price),
          }))
        : [
            {
              size: "único",
              price: parseFloat(form.singlePrice),
            },
          ],
      extras: productExtras.length > 0 ? productExtras : undefined,
    };

    onSubmit(
      form.category,
      newProduct,
      editing ? editing.product.name : undefined
    );
  };

  return {
    form,
    setForm,
    extras,
    handleCategoryChange,
    handleAddExtra,
    handleRemoveExtra,
    handleExtraNameChange,
    handleExtraPriceChange,
    handleSubmit,
  };
}
