import { Product, ProductSize, ProductFormState, ExtraFormItem } from "../types/product";
import { ExtraIngredientDef } from "../types/extras";
import { PIZZA_SIZES, IS_PIZZA, PIZZA_DEFAULTS } from "../config/constants";

export const productMapper = {
  /** Map a domain Product to Form state */
  toFormState: (product: Product | null, category: string): ProductFormState => {
    if (!product) {
      return {
        name: "",
        description: "",
        category: "",
        prices: PIZZA_DEFAULTS.map((p: { size: string; price: string }) => ({ ...p })),
        singlePrice: "",
      };
    }

    const isPizzaCategory = IS_PIZZA(category);
    return {
      name: product.name,
      description: product.description || "",
      category,
      prices: isPizzaCategory
        ? product.prices.map((p: { size: string; price: number }) => ({
            size: p.size,
            price: p.price.toString(),
          }))
        : [{ size: "único", price: product.prices[0].price.toString() }],
      singlePrice: isPizzaCategory ? "" : product.prices[0].price.toString(),
    };
  },

  /** Map Domain extras to Form extras */
  toFormExtras: (extras: ExtraIngredientDef[] | undefined): ExtraFormItem[] => {
    if (!extras?.length) return [];

    return extras.map((ext) => ({
      name: ext.name,
      prices: PIZZA_SIZES.map((s) => {
        const found = ext.prices.find((p) => p.size === s);
        return { size: s, price: found ? found.price.toString() : "" };
      }),
    }));
  },

  /** Map Form state to Domain Product */
  toDomainProduct: (form: ProductFormState, extras: ExtraFormItem[]): Product => {
    const isPizzaCategory = IS_PIZZA(form.category);

    const productExtras: ExtraIngredientDef[] = isPizzaCategory
      ? extras
          .filter((ext) => ext.name.trim() !== "")
          .map((ext: ExtraFormItem) => ({
            name: ext.name.trim(),
            prices: ext.prices
              .filter((p: { price: string }) => p.price !== "" && parseFloat(p.price) > 0)
              .map((p: { size: string; price: string }) => ({
                size: p.size as ProductSize,
                price: parseFloat(p.price),
              })),
          }))
          .filter((ext) => ext.prices.length > 0)
      : [];

    return {
      name: form.name,
      description: form.description.trim() || undefined,
      prices: isPizzaCategory
        ? form.prices.map((p: { size: string; price: string }) => ({
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
  },
};
