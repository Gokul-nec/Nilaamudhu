import type { Product, StockStatus } from "./types";
import { toPaise } from "./pricing";

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return null;
}

export function sortedImages(product: Product) {
  return [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export function activeVariants(product: Product) {
  return [...(product.product_variants ?? [])].filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

/** Price shown on cards. For package-based products this is the lowest package price. */
export function displayPrice(product: Product): { paise: number; isFrom: boolean } | null {
  const variants = activeVariants(product);
  if (variants.length > 0) {
    const min = Math.min(...variants.map((v) => toPaise(v.price)));
    return { paise: min, isFrom: variants.length > 1 };
  }
  if (product.price === null) return null;
  return { paise: toPaise(product.price), isFrom: false };
}

/** A product with package options is out of stock only when every active package is. */
export function effectiveStock(product: Product): StockStatus {
  if (product.stock_status === "out_of_stock") return "out_of_stock";
  const variants = activeVariants(product);
  if (variants.length === 0) return product.stock_status;
  if (variants.every((v) => v.stock_status === "out_of_stock")) return "out_of_stock";
  if (product.stock_status === "limited" || variants.some((v) => v.stock_status === "limited")) return "limited";
  return "in_stock";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Formats a variant label into a compact pill label (e.g. "500 g Pack" -> "500g", "1 kg Bag" -> "1kg"). */
export function formatVariantPill(label: string | null | undefined): string {
  if (!label) return "";
  const cleaned = label
    .replace(/\s*(Pack|Bag|பை|பேக்|பாக்கெட்)\s*/gi, "")
    .replace(/(\d+)\s*g\b/gi, "$1g")
    .replace(/(\d+)\s*kg\b/gi, "$1kg")
    .replace(/(\d+)\s*கிலோ\b/gi, "$1kg")
    .replace(/(\d+)\s*கிராம்\b/gi, "$1g")
    .trim();
  return cleaned || label.trim();
}
