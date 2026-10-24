"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Lang, Product } from "@/lib/types";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { activeVariants, effectiveStock, formatVariantPill, imageUrl, sortedImages } from "@/lib/product-utils";
import { formatMoney, toPaise, UNIT_LABELS } from "@/lib/pricing";
import { PlaceholderImage, StockBadge } from "./ui";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({
  product,
  lang,
  currency,
  priority = false,
}: {
  product: Product;
  lang: Lang;
  currency: string;
  priority?: boolean;
}) {
  const t = dictionaries[lang];
  const name = pick(lang, product.name_en, product.name_ta);
  const blurb = pick(lang, product.short_description_en, product.short_description_ta);

  const variants = activeVariants(product);
  const hasVariants = variants.length > 0;

  // Default to first in-stock variant or first available variant
  const firstAvailable = variants.find((v) => v.stock_status !== "out_of_stock") ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(firstAvailable?.id ?? null);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? firstAvailable ?? null;

  // Auto-calculated price based on selected gram / package size
  const pricePaise = selectedVariant
    ? toPaise(selectedVariant.price)
    : product.price !== null
    ? toPaise(product.price)
    : null;

  // Strikethrough MRP (~22% higher) as shown in the design
  const mrpPaise = pricePaise !== null ? Math.round((pricePaise * 1.22) / 100) * 100 : null;

  // Stock status of selected variant or product
  const stock = selectedVariant ? selectedVariant.stock_status : effectiveStock(product);
  const isOutOfStock = stock === "out_of_stock";

  const image = sortedImages(product)[0];
  const src = imageUrl(image?.path);
  const href = `/products/${product.slug}`;
  const prefersReduced = useReducedMotion();

  return (
    <motion.article
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={prefersReduced ? undefined : { y: -4 }}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Image */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-ivory)]" aria-label={name.text} tabIndex={-1}>
        {src ? (
          <Image
            src={src}
            alt={(lang === "ta" ? image.alt_ta : image.alt_en) || image.alt_en || name.text}
            fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : <PlaceholderImage label={t.common.placeholderImage} />}

        {/* Stock overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[var(--color-danger)] shadow-sm">{t.common.outOfStock}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <h3 className="text-base leading-snug font-semibold text-[var(--color-ink)]">
          <Link href={href} className="hover:text-[var(--color-forest-800)] hover:underline underline-offset-4 transition-colors">{name.text}</Link>
        </h3>
        {name.pending && <p className="text-xs text-[var(--color-gold-700)]">{t.common.tamilPending}</p>}
        {blurb.text && <p className="line-clamp-2 text-sm text-[var(--color-muted)] leading-relaxed">{blurb.text}</p>}

        {/* Price + Strikethrough MRP (No "From" label) */}
        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              {pricePaise !== null ? (
                <>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--color-forest-900)] tracking-tight">
                    {formatMoney(pricePaise, currency)}
                  </span>
                  {mrpPaise !== null && mrpPaise > pricePaise && (
                    <span className="text-sm font-normal text-neutral-400 line-through">
                      {formatMoney(mrpPaise, currency)}
                    </span>
                  )}
                  {!hasVariants && (
                    <span className="text-xs text-[var(--color-muted)] font-normal">
                      {" "}/ {UNIT_LABELS[product.pricing_unit][lang]}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base text-[var(--color-muted)]">{t.product.priceOnRequest}</span>
              )}
            </div>
            <StockBadge status={stock} lang={lang} />
          </div>

          {/* Choosable Gram / Package Pills */}
          {hasVariants && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Available package sizes">
              {variants.map((v) => {
                const isSelected = v.id === selectedVariant?.id;
                const pillLabel = formatVariantPill(pick(lang, v.label_en, v.label_ta).text);
                const isVariantOut = v.stock_status === "out_of_stock";
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#ffc107] text-[#1c2c1e] shadow-sm border border-[#e0a800] ring-1 ring-[#ffc107]/50"
                        : "bg-white text-[var(--color-ink)] border border-neutral-300 hover:border-[var(--color-forest-700)] hover:bg-[var(--color-ivory)]"
                    } ${isVariantOut ? "opacity-50" : ""}`}
                    aria-pressed={isSelected}
                    title={v.label_en}
                  >
                    {pillLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={href}
            className={`btn btn-outline !min-h-10 ${lang === "ta" ? "!px-2 text-xs font-bold" : "!px-3 text-sm"}`}
          >
            {t.common.viewDetails}
          </Link>
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariant?.id ?? null}
            quantity={1}
            rule={
              hasVariants
                ? { min: 1, step: 1, max: product.max_quantity }
                : { min: product.min_quantity, step: product.quantity_step, max: product.max_quantity }
            }
            disabled={isOutOfStock}
            compact
          />
        </div>
      </div>
    </motion.article>
  );
}
