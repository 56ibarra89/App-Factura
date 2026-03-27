import { ProductSize } from "../types/product";

export const PRODUCT_CATEGORIES = [
  "Pizzas",
  "Mexicanos",
  "Submarinos",
  "Alitas",
  "Postres",
  "Bebidas",
] as const;

export type CategoryName = (typeof PRODUCT_CATEGORIES)[number];

export const PIZZA_SIZES: ProductSize[] = ["familiar", "mediana", "personal"];

export const PIZZA_DEFAULTS = PIZZA_SIZES.map((size) => ({
  size,
  price: "",
}));

export const IS_PIZZA = (category: string) => category === "Pizzas";

export const EMPTY_EXTRA_PRICES = PIZZA_SIZES.map((size) => ({
  size,
  price: "",
}));
