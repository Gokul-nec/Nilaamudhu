"use client";

import { ShoppingBasket } from "lucide-react";
import { useCartActions, useLang } from "./Providers";
import type { QuantityRule } from "@/lib/pricing";

export function AddToCartButton(props: {
  productId: string;
  variantId?: string | null;
  quantity: number;
  rule: QuantityRule;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
  className?: string;
}) {
  const { add } = useCartActions();
  const { lang, t } = useLang();
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={() => add({ productId: props.productId, variantId: props.variantId ?? null, quantity: props.quantity }, props.rule)}
      className={`btn btn-primary ${
        props.compact
          ? `!min-h-9 sm:!min-h-10 ${lang === "ta" ? "!px-2 text-xs font-bold" : "!px-2.5 sm:!px-3 text-xs sm:text-sm"}`
          : lang === "ta" ? "w-full text-sm sm:text-base font-bold" : "w-full"
      } ${props.className ?? ""}`}
    >
      <ShoppingBasket className={`${props.compact ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0`} aria-hidden />
      <span className="truncate min-w-0">{props.disabled ? t.common.outOfStock : props.label ?? t.common.addToCart}</span>
    </button>
  );
}
