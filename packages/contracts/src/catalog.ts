export interface Product {
  sku: string;
  price: number;
  initialStock: number;
}

export const CATALOG: readonly Product[] = [
  { sku: "KEYBOARD", price: 450, initialStock: 50 },
  { sku: "MONITOR", price: 1_800, initialStock: 10 },
  { sku: "HEADPHONES", price: 300, initialStock: 0 },
];

export const CARD_LIMIT = 5_000;

export const COVERED_CITIES: readonly string[] = ["Quetzaltenango", "Guatemala", "Antigua Guatemala"];

export const ALL_CITIES: readonly string[] = [...COVERED_CITIES, "Flores"];

export function findProduct(sku: string): Product | undefined {
  return CATALOG.find((product) => product.sku === sku);
}
