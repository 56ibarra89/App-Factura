import type {
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
    const priceBySize = new Map(
      product.prices.map((price) => [price.size.toLowerCase(), price.price]),
    );
    const baseSizes = ["familiar", "mediana", "personal"];
    return {
      name: product.name,
      description: product.description || "",
      category,
      hasMultipleSizes,
      prices: hasMultipleSizes
        ? baseSizes.map((size) => ({
            size,
            price: priceBySize.get(size)?.toString() ?? "",
          }))
        : defaults,
      singlePrice: hasMultipleSizes ? "" : product.prices[0]?.price.toString() || "",
    };
  },

  toDomainProduct: (form: ProductFormState): Product => {
    const hasMultipleSizes = form.hasMultipleSizes;

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
    };
  },
};
