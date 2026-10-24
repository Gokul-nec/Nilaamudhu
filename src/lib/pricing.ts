import type { PricingUnit } from "./types";

/** All money maths is done in integer paise and thousandths to avoid float drift. */
export const toPaise = (price: number): number => Math.round(price * 100);
export const toMilli = (qty: number): number => Math.round(qty * 1000);

export function lineTotalPaise(unitPricePaise: number, quantity: number): number {
  return Math.round((unitPricePaise * toMilli(quantity)) / 1000);
}

export function formatMoney(paise: number, symbol = "₹"): string {
  const whole = paise % 100 === 0;
  const text = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
  return `${symbol}${text}`;
}

export function formatQuantity(quantity: number): string {
  return String(Number(quantity.toFixed(3)));
}

export interface QuantityRule {
  min: number;
  step: number;
  max: number;
}

export function isValidQuantity(quantity: number, rule: QuantityRule): boolean {
  if (!Number.isFinite(quantity)) return false;
  const q = toMilli(quantity);
  const min = toMilli(rule.min);
  const step = toMilli(rule.step);
  const max = toMilli(rule.max);
  if (q < min || q > max || step <= 0) return false;
  return (q - min) % step === 0;
}

export function clampQuantity(quantity: number, rule: QuantityRule): number {
  const min = toMilli(rule.min);
  const step = toMilli(rule.step);
  const max = toMilli(rule.max);
  let q = Math.min(Math.max(toMilli(quantity), min), max);
  q = min + Math.round((q - min) / step) * step;
  if (q > max) q -= step;
  return q / 1000;
}

export const UNIT_LABELS: Record<PricingUnit, { en: string; ta: string }> = {
  kg: { en: "kg", ta: "கிலோ" },
  g: { en: "g", ta: "கிராம்" },
  litre: { en: "litre", ta: "லிட்டர்" },
  piece: { en: "piece", ta: "எண்" },
  pack: { en: "pack", ta: "பொட்டலம்" },
};
