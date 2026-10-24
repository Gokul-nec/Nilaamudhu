import type { CartItem, PricedCart, PricedLine, Product } from "./types";
import { isValidQuantity, lineTotalPaise, toPaise } from "./pricing";

/**
 * Prices a browser-supplied cart against trusted catalogue data.
 * The browser only ever sends { productId, variantId, quantity }; every price,
 * name and availability flag used here comes from the database.
 */
export function priceCart(items: CartItem[], catalogue: Map<string, Product>): PricedCart {
  const lines: PricedLine[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? "base"}`;
    if (seen.has(key)) continue; // merge duplicates by ignoring repeats
    seen.add(key);

    const product = catalogue.get(item.productId);
    if (!product) {
      lines.push(placeholderLine(key, item, "unavailable"));
      continue;
    }

    const variants = (product.product_variants ?? []).filter((v) => v.is_active);
    const usesVariants = variants.length > 0;
    const image = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];

    const base: Omit<PricedLine, "unitPricePaise" | "linePaise" | "issue" | "stock" | "variantLabel_en" | "variantLabel_ta" | "step" | "min" | "max"> = {
      key,
      productId: product.id,
      variantId: item.variantId,
      slug: product.slug,
      name_en: product.name_en,
      name_ta: product.name_ta,
      imagePath: image?.path ?? null,
      unit: product.pricing_unit,
      quantity: item.quantity,
    };

    let unitPrice: number | null;
    let stock = product.stock_status;
    let variantLabelEn: string | null = null;
    let variantLabelTa: string | null = null;
    let rule = { min: product.min_quantity, step: product.quantity_step, max: product.max_quantity };
    let issue: PricedLine["issue"] = null;

    if (usesVariants) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        lines.push({
          ...base, variantLabel_en: null, variantLabel_ta: null, unitPricePaise: 0, linePaise: 0,
          stock: product.stock_status, step: 1, min: 1, max: product.max_quantity, issue: "variant_unavailable",
        });
        continue;
      }
      unitPrice = variant.price;
      variantLabelEn = variant.label_en;
      variantLabelTa = variant.label_ta;
      rule = { min: 1, step: 1, max: product.max_quantity };
      if (product.stock_status === "out_of_stock" || variant.stock_status === "out_of_stock") stock = "out_of_stock";
      else if (variant.stock_status === "limited") stock = "limited";
    } else {
      if (item.variantId) {
        lines.push({
          ...base, variantLabel_en: null, variantLabel_ta: null, unitPricePaise: 0, linePaise: 0,
          stock: product.stock_status, step: rule.step, min: rule.min, max: rule.max, issue: "variant_unavailable",
        });
        continue;
      }
      unitPrice = product.price;
    }

    const unitPricePaise = unitPrice === null ? 0 : toPaise(unitPrice);
    if (unitPrice === null) issue = "no_price";
    else if (stock === "out_of_stock") issue = "out_of_stock";
    else if (!isValidQuantity(item.quantity, rule)) issue = "invalid_quantity";

    lines.push({
      ...base,
      variantLabel_en: variantLabelEn,
      variantLabel_ta: variantLabelTa,
      unitPricePaise,
      linePaise: issue ? 0 : lineTotalPaise(unitPricePaise, item.quantity),
      stock,
      step: rule.step,
      min: rule.min,
      max: rule.max,
      issue,
    });
  }

  const orderable = lines.filter((l) => !l.issue);
  return {
    lines,
    subtotalPaise: orderable.reduce((sum, l) => sum + l.linePaise, 0),
    hasBlockingIssue: lines.some((l) => l.issue !== null),
    orderableCount: orderable.length,
  };
}

function placeholderLine(key: string, item: CartItem, issue: PricedLine["issue"]): PricedLine {
  return {
    key, productId: item.productId, variantId: item.variantId, slug: "", name_en: "", name_ta: null,
    variantLabel_en: null, variantLabel_ta: null, imagePath: null, unit: "pack", unitPricePaise: 0,
    quantity: item.quantity, step: 1, min: 1, max: 1, linePaise: 0, stock: "out_of_stock", issue,
  };
}
