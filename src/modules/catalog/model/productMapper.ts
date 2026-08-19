import type {
  ExtraFormItem,
  ExtraIngredientDef,
  Product,
  ProductFormState,
  ProductSize,
} from "./catalog.types";

export const productMapper = {

  toFormState: (product: Product | null, category: string): ProductFormState => {
    const defaults: { size: string; price: string }[] = [];
    if (!product) {
      return {
        name: "",
        description: "",
        category: "",
        hasMultipleSizes: false,
        prices: defaults,
        singlePrice: "",
      };
    }

    const hasMultipleSizes = product.hasMultipleSizes ?? false;
    return {
      name: product.name,
      description: product.description || "",
      category,
      hasMultipleSizes,
      prices: hasMultipleSizes
        ? product.prices.map((p: { size: string; price: number }) => ({
            size: p.size,
            price: p.price.toString(),
          }))
        : defaults,
      singlePrice: hasMultipleSizes ? "" : product.prices[0]?.price.toString() || "",
    };
  },

  toFormExtras: (extras: ExtraIngredientDef[] | undefined, hasMultipleSizes: boolean, dynamicSizes: string[]): ExtraFormItem[] => {
    if (!extras?.length) return [];

    return extras.map((ext) => ({
      name: ext.name,
      prices: hasMultipleSizes
        ? dynamicSizes.map((s) => {
            const found = ext.prices.find((p) => p.size === s);
            return { size: s, price: found ? found.price.toString() : "" };
          })
        : [{ size: "único", price: ext.prices[0]?.price.toString() || "" }],
    }));
  },

  toDomainProduct: (form: ProductFormState, extras: ExtraFormItem[]): Product => {
    const hasMultipleSizes = form.hasMultipleSizes;

    const productExtras: ExtraIngredientDef[] = extras
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
      .filter((ext) => ext.prices.length > 0);

    return {
      name: form.name,
      description: form.description.trim() || undefined,
      hasMultipleSizes,
      prices: hasMultipleSizes
        ? form.prices
            .filter((p: { price: string }) => p.price !== "" && parseFloat(p.price) > 0)
            .map((p: { size: string; price: string }) => ({
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

