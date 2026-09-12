
export type ProductSize = string;

export interface ExtraPrice {
  size: ProductSize;
  price: number;
}

export interface ExtraIngredientDef {
  name: string;
  prices: ExtraPrice[];
}

export interface SelectedExtra {
  name: string;
  price: number;
}

export interface PackagingSizeConfig {
  name: string;
  price: number;
}

export interface ProductPrice {
  size: ProductSize;
  price: number;
}

export interface ComboGroupOptionDef {
  id?: string;
  itemProductId: string;
  itemProductName?: string;
  size?: string;
  extraPrice?: number;
}

export interface ComboGroupDef {
  id?: string;
  name: string;
  requiredCount: number;
  options: ComboGroupOptionDef[];
}

export interface Product {
  id?: string;
  categoryId?: string;
  name: string;
  description?: string;
  prices: ProductPrice[];
  hasMultipleSizes?: boolean;
  isCombo?: boolean;
  comboPrice?: number;
  comboGroups?: ComboGroupDef[];
  extras?: ExtraIngredientDef[];
}

export interface Category {
  id?: string;
  label: string;
  icon?: string;
  kitchenId?: string;
  items: Product[];
}

export interface ExtraFormItem {
  name: string;
  prices: { size: string; price: string }[];
}

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  hasMultipleSizes: boolean;
  prices: { size: string; price: string }[];
  singlePrice: string;
}

