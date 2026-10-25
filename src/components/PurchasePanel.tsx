"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useCartActions, useLang } from "./Providers";
import { clampQuantity, formatMoney, formatQuantity, lineTotalPaise, toMilli, toPaise, UNIT_LABELS } from "@/lib/pricing";
import { pick } from "@/lib/i18n/lang";
import type { PricingUnit, StockStatus } from "@/lib/types";
import { StockBadge } from "./ui";

export interface PanelVariant {
  id: string;
  label_en: string;
  label_ta: string | null;
  price: number;
  stock: StockStatus;
}

export interface PanelProps {
  productId: string;
  unit: PricingUnit;
  price: number | null;
  min: number;
  step: number;
  max: number;
  stock: StockStatus;
  currency: string;
  variants: PanelVariant[];
}

export function PurchasePanel(p: PanelProps) {
  const { lang, t } = useLang();
  const { add, setOpen } = useCartActions();
  const hasVariants = p.variants.length > 0;
  const firstAvailable = p.variants.find((v) => v.stock !== "out_of_stock") ?? p.variants[0];
  const [variantId, setVariantId] = useState<string | null>(firstAvailable?.id ?? null);
  const rule = useMemo(
    () => (hasVariants ? { min: 1, step: 1, max: p.max } : { min: p.min, step: p.step, max: p.max }),
    [hasVariants, p.min, p.step, p.max]
  );
  const [qty, setQty] = useState(rule.min);

  const variant = p.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = hasVariants ? variant?.price ?? null : p.price;
  const stock: StockStatus = hasVariants
    ? p.stock === "out_of_stock"
      ? "out_of_stock"
      : variant?.stock ?? "out_of_stock"
    : p.stock;
  const soldOut = stock === "out_of_stock" || unitPrice === null;
  const unitPricePaise = unitPrice === null ? null : toPaise(unitPrice);
  const mrpPaise = unitPricePaise !== null ? Math.round((unitPricePaise * 1.22) / 100) * 100 : null;
  const total = unitPrice === null ? null : lineTotalPaise(toPaise(unitPrice), qty);
  const unitText = hasVariants ? t.product.pack : UNIT_LABELS[p.unit][lang];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          {unitPricePaise === null ? (
            <span className="text-xl text-[var(--color-muted)]">{t.product.priceOnRequest}</span>
          ) : (
            <>
              <span className="text-3xl sm:text-4xl font-bold text-[var(--color-forest-900)] tracking-tight">
                {formatMoney(unitPricePaise, p.currency)}
              </span>
              {mrpPaise !== null && mrpPaise > unitPricePaise && (
                <span className="text-lg font-normal text-neutral-400 line-through">
                  {formatMoney(mrpPaise, p.currency)}
                </span>
              )}
              <span className="text-base font-normal text-[var(--color-muted)]"> / {unitText}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-[var(--color-muted)]">{t.product.availability}:</span>
          <StockBadge status={stock} lang={lang} />
        </div>
      </div>

      {hasVariants && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t.product.packageSize}
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.variants.map((v) => {
              const selected = v.id === variantId;
              const out = v.stock === "out_of_stock";
              return (
                <label
                  key={v.id}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition-all has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--color-gold-500)] ${
                    selected
                      ? "bg-[#ffc107] text-[#1c2c1e] shadow-sm border-[#e0a800] ring-1 ring-[#ffc107]/50"
                      : "border-neutral-300 bg-white text-[var(--color-ink)] hover:border-[var(--color-forest-700)] hover:bg-[var(--color-ivory)]"
                  } ${out ? "opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={selected}
                    onChange={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className="sr-only"
                  />
                  {pick(lang, v.label_en, v.label_ta).text}
                  {out ? ` · ${t.common.outOfStock}` : ""}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]" id="qty-label">
          {t.product.quantity}
          {!hasVariants && ` (${UNIT_LABELS[p.unit][lang]})`}
        </p>
        <div
          className="inline-flex items-center rounded-full border border-[var(--color-line)] bg-white shadow-sm"
          role="group"
          aria-labelledby="qty-label"
        >
          <button
            type="button"
            aria-label={t.product.decrease}
            disabled={toMilli(qty) <= toMilli(rule.min)}
            onClick={() => setQty(clampQuantity(qty - rule.step, rule))}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--color-forest-50)] disabled:opacity-40 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <output className="min-w-14 px-2 text-center text-base font-semibold" aria-live="polite">
            {formatQuantity(qty)}
          </output>
          <button
            type="button"
            aria-label={t.product.increase}
            disabled={toMilli(qty) >= toMilli(rule.max)}
            onClick={() => setQty(clampQuantity(qty + rule.step, rule))}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--color-forest-50)] disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {total !== null && (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {t.product.total}:{" "}
            <span className="font-bold text-lg text-[var(--color-forest-900)]">{formatMoney(total, p.currency)}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={soldOut}
          className="btn btn-primary flex-1 shadow-[var(--shadow-green)]"
          onClick={() =>
            add(
              { productId: p.productId, variantId: hasVariants ? variantId : null, quantity: qty },
              rule
            )
          }
        >
          <ShoppingBasket className="h-5 w-5" aria-hidden />
          {soldOut ? t.common.outOfStock : t.common.addToCart}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(true)}>
          {t.cart.open}
        </button>
      </div>
    </div>
  );
}
