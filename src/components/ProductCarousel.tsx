"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Wheat } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Lang, Product } from "@/lib/types";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { activeVariants, effectiveStock, formatVariantPill, imageUrl, sortedImages } from "@/lib/product-utils";
import { formatMoney, toPaise, UNIT_LABELS } from "@/lib/pricing";
import { StockBadge } from "./ui";
import { AddToCartButton } from "./AddToCartButton";
import { useLang } from "./Providers";

interface ProductCarouselProps {
  products: Product[];
  lang?: Lang;
  currency: string;
  intervalMs?: number;
}

export function ProductCarousel({ products, lang: initialLang = "en", currency, intervalMs = 5000 }: ProductCarouselProps) {
  const { lang: currentLang, t: currentT } = useLang();
  const lang = currentLang ?? initialLang;
  const t = currentT ?? dictionaries[lang];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [selectedVariantIdMap, setSelectedVariantIdMap] = useState<Record<string, string>>({});
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const prefersReduced = useReducedMotion();
  const reducedMotion = Boolean(prefersReduced);

  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const count = products.length;

  const nextSlide = useCallback(() => {
    setDirection("next");
    setIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    setDirection("prev");
    setIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goToSlide = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? "next" : "prev");
    setIndex(i);
  };

  const isPaused = isUserPaused || isHovered || isFocused || reducedMotion;

  // Auto-play interval
  useEffect(() => {
    if (count <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isPaused, intervalMs, nextSlide]);

  if (count === 0) return null;

  const current = products[index];
  const name = pick(lang, current.name_en, current.name_ta);
  const blurb = pick(lang, current.short_description_en, current.short_description_ta);
  const variants = activeVariants(current);
  const hasVariants = variants.length > 0;
  const firstAvailable = variants.find((v) => v.stock_status !== "out_of_stock") ?? variants[0];
  const selectedVariantId = selectedVariantIdMap[current.id] ?? firstAvailable?.id ?? null;
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? firstAvailable ?? null;

  const pricePaise = selectedVariant
    ? toPaise(selectedVariant.price)
    : current.price !== null
    ? toPaise(current.price)
    : null;

  const mrpPaise = pricePaise !== null ? Math.round((pricePaise * 1.22) / 100) * 100 : null;
  const stock = selectedVariant ? selectedVariant.stock_status : effectiveStock(current);
  const isOutOfStock = stock === "out_of_stock";
  const image = sortedImages(current)[0];
  const src = imageUrl(image?.path);
  const href = `/products/${current.slug}`;

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="group/carousel relative mb-14 overflow-hidden rounded-2xl sm:rounded-[2.25rem] border border-[var(--color-line)] bg-gradient-to-br from-white via-[var(--color-cream)] to-[var(--color-ivory)] p-4 sm:p-10 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-800)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={lang === "ta" ? "சிறப்புப் பொருட்கள் ஸ்லைடர்" : "Featured Products Carousel"}
    >
      {/* Background ambient lighting - calm & static */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--color-gold-300)]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--color-forest-700)]/10 blur-3xl"
        aria-hidden
      />

      {/* Main Showcase Grid */}
      <div className="relative grid items-center gap-6 sm:gap-8 md:grid-cols-[1.15fr_0.85fr] lg:gap-12 min-h-[340px] sm:min-h-[380px]">
        {/* Left Column: Product Information & CTAs */}
        <div
          key={`content-${current.id}`}
          className={`flex flex-col justify-center ${
            reducedMotion
              ? ""
              : direction === "next"
              ? "animate-carousel-content-next"
              : "animate-carousel-content-prev"
          }`}
        >
          {/* Spotlight Badge */}
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/30 bg-gradient-to-r from-[var(--color-gold-500)]/15 to-[var(--color-gold-700)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-gold-700)] w-fit shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-gold-500)]" aria-hidden />
            <span>{lang === "ta" ? "சிறப்புத் தேர்வு" : "Featured Spotlight"}</span>
          </div>

          {/* Product Title & Subtitle with stable min-height */}
          <div className="min-h-[4rem] sm:min-h-[4.75rem] flex flex-col justify-center">
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--color-ink)] leading-tight">
              <Link href={href} className="hover:text-[var(--color-forest-900)] transition-colors">
                {name.text}
              </Link>
            </h3>

            {/* Secondary language subtitle */}
            {lang === "ta" && current.name_en && (
              <p className="mt-1 text-sm font-medium text-[var(--color-muted)]">{current.name_en}</p>
            )}
            {lang === "en" && current.name_ta && (
              <p className="mt-1 text-sm font-medium text-[var(--color-forest-800)]/80" lang="ta">
                {current.name_ta}
              </p>
            )}
          </div>

          {/* Short Blurb with stable min-height to prevent layout jump */}
          <div className="min-h-[4.25rem] sm:min-h-[4.75rem] mt-3 flex items-start">
            {blurb.text ? (
              <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed line-clamp-3">
                {blurb.text}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-[var(--color-muted)]/70 italic">
                {lang === "ta" ? "பாரம்பரிய முறையில் விளைவிக்கப்பட்ட இயற்கை உணவுப் பொருள்." : "Authentic, naturally cultivated traditional Indian specialty."}
              </p>
            )}
          </div>

          {/* Price & Availability with stable layout */}
          <div className="mt-4 flex flex-wrap items-baseline gap-3 min-h-[2.5rem]">
            {pricePaise !== null ? (
              <>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-forest-900)] tracking-tight">
                  {formatMoney(pricePaise, currency)}
                </span>
                {mrpPaise !== null && mrpPaise > pricePaise && (
                  <span className="text-base sm:text-lg font-normal text-neutral-400 line-through">
                    {formatMoney(mrpPaise, currency)}
                  </span>
                )}
                {!hasVariants && (
                  <span className="text-sm font-normal text-[var(--color-muted)]">
                    {" "}
                    / {UNIT_LABELS[current.pricing_unit][lang]}
                  </span>
                )}
              </>
            ) : (
              <span className="text-base text-[var(--color-muted)]">{t.product.priceOnRequest}</span>
            )}
            <div className="ml-auto sm:ml-2">
              <StockBadge status={stock} lang={lang} />
            </div>
          </div>

          {/* Choosable Gram / Package Pills with stable min-height */}
          <div className="mt-3 min-h-[2.25rem] flex flex-wrap items-center gap-2" role="group" aria-label="Available package sizes">
            {hasVariants ? (
              variants.map((v) => {
                const isSelected = v.id === selectedVariant?.id;
                const pillLabel = formatVariantPill(pick(lang, v.label_en, v.label_ta).text);
                const isVariantOut = v.stock_status === "out_of_stock";
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariantIdMap((prev) => ({ ...prev, [current.id]: v.id }));
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all ${
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
              })
            ) : (
              <span className="text-xs text-[var(--color-muted)] font-medium">
                {lang === "ta" ? "இயற்கை பொதி அளவு" : "Standard pack"} (1 {UNIT_LABELS[current.pricing_unit][lang]})
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              href={href}
              className="btn btn-primary !px-6 shadow-[var(--shadow-green)] transition-transform hover:scale-105 active:scale-95 justify-center"
            >
              <span>{t.common.viewDetails}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <div className="w-full sm:w-fit">
              <AddToCartButton
                productId={current.id}
                variantId={selectedVariant?.id ?? null}
                quantity={1}
                rule={
                  hasVariants
                    ? { min: 1, step: 1, max: current.max_quantity }
                    : { min: current.min_quantity, step: current.quantity_step, max: current.max_quantity }
                }
                disabled={isOutOfStock}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Premium Handcrafted Ceramic Plate Image Showcase */}
        <div className="flex items-center justify-center py-2 sm:py-4">
          <div
            key={`image-${current.id}`}
            className={`relative flex aspect-square w-full max-w-[220px] sm:max-w-[320px] lg:max-w-[360px] items-center justify-center ${
              reducedMotion ? "" : "animate-carousel-plate"
            }`}
          >
            {/* Concentric Decorative Rings - Calm, Premium & Traditional */}
            <div
              className="pointer-events-none absolute -inset-3.5 rounded-full border border-[var(--color-gold-500)]/20 bg-gradient-to-tr from-[var(--color-gold-300)]/10 via-transparent to-[var(--color-forest-700)]/10"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -inset-1 rounded-full border border-[var(--color-forest-900)]/15"
              aria-hidden
            />

            {/* Circular Plate Container with subtle shadow and border */}
            <Link
              href={href}
              tabIndex={-1}
              aria-label={name.text}
              className="group/img relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[5px] sm:border-[6px] border-white bg-gradient-to-b from-[#fdfbf7] to-[#ede3d1] shadow-[0_20px_48px_-12px_rgba(20,83,45,0.22)] transition-transform duration-500 hover:scale-[1.02]"
            >
              {src ? (
                <Image
                  src={src}
                  alt={(lang === "ta" ? image?.alt_ta : image?.alt_en) || image?.alt_en || name.text}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 320px, 270px"
                  priority
                  className="rounded-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                />
              ) : (
                /* Brand-Aligned Graceful Fallback */
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-[var(--color-forest-900)]/70">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-forest-50)] text-[var(--color-forest-800)] border border-[var(--color-forest-100)]">
                    <Wheat className="h-8 w-8 text-[var(--color-forest-800)]" aria-hidden />
                  </div>
                  <span className="font-display text-sm font-semibold text-[var(--color-ink)]">
                    {name.text}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-gold-700)] uppercase tracking-wider">
                    {lang === "ta" ? "நிலாமுது பாரம்பரியம்" : "Nilaamudhu Harvest"}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Controls Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-line)] pt-5">
        {/* Left: Previous, Next & Pause/Play buttons with 44px touch targets */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label={t.common.previous}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-forest-900)] shadow-sm transition-all hover:bg-[var(--color-forest-900)] hover:text-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-800)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label={t.common.next}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-forest-900)] shadow-sm transition-all hover:bg-[var(--color-forest-900)] hover:text-white hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-800)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsUserPaused((p) => !p)}
            aria-label={isUserPaused ? "Play carousel" : "Pause carousel"}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-muted)] shadow-sm transition-all hover:bg-[var(--color-ivory)] hover:text-[var(--color-forest-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-forest-800)]"
          >
            {isUserPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        {/* Center: Slide indicator dots with enlarged touch target */}
        <div className="flex items-center gap-1" role="tablist" aria-label="Slides">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1} of ${count}`}
              onClick={() => goToSlide(i)}
              className="flex items-center justify-center p-2 min-h-[44px] focus-visible:outline-none"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-[var(--color-forest-900)] shadow-xs"
                    : "w-2 bg-[var(--color-sand)] hover:bg-[var(--color-gold-500)]"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Right: Slide Counter */}
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-1 text-[var(--color-sand)]">/</span>
          <span>{String(count).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Auto-play Timer Progress Bar (Pure CSS GPU-driven animation) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-sand)]/30 overflow-hidden" aria-hidden>
        <div
          key={`${index}-${isPaused}`}
          className="h-full bg-[var(--color-forest-900)] carousel-progress-bar"
          style={{
            ["--carousel-duration" as string]: `${intervalMs}ms`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        />
      </div>
    </div>
  );
}
