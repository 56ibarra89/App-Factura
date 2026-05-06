import { ProductSize } from "../types/product";

export const PIZZA_SIZES: ProductSize[] = ["familiar", "mediana", "personal"];

export const PIZZA_DEFAULTS = PIZZA_SIZES.map((size) => ({
  size,
  price: "",
}));

export const EMPTY_EXTRA_PRICES = PIZZA_SIZES.map((size) => ({
  size,
  price: "",
}));
