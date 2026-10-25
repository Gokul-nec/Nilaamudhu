"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart, useLang } from "./Providers";
import type { PricedCart } from "@/lib/types";
import { formatMoney, formatQuantity, clampQuantity, toMilli } from "@/lib/pricing";
import { lineName, lineQuantityText, unitPriceText } from "@/lib/whatsapp";
import { imageUrl } from "@/lib/product-utils";
import { PlaceholderImage } from "./ui";
import { MessageCircle } from "lucide-react";

type CartResponse = PricedCart & { currencySymbol: string; whatsappConfigured: boolean; whatsappUrl: string | null };

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, clear, hydrated } = useCart();
  const { lang, t } = useLang();
  const [data, setData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFetchedItemsRef = useRef<string>("");

  const load = useCallback(async (signal: AbortSignal) => {
    if (items.length === 0) { setData(null); setFailed(false); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal,
        body: JSON.stringify({ lang, items }),
      });
      if (!res.ok) throw new Error("bad response");
      setData(await res.json());
      lastFetchedItemsRef.current = JSON.stringify(items);
      setFailed(false);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setFailed(true);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [items, lang]);

  useEffect(() => {
    if (!isOpen || !hydrated || items.length === 0) return;

    const currentKey = JSON.stringify(items);
    // When drawer reopens and items haven't changed, reuse already priced cart
    if (data && currentKey === lastFetchedItemsRef.current) {
      return;
    }

    const controller = new AbortController();
    const delay = data ? 200 : 0;
    const timer = setTimeout(() => load(controller.signal), delay);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [isOpen, hydrated, items, data, load]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isOpen, setOpen]);

  if (!isOpen) return null;
  const symbol = data?.currencySymbol ?? "₹";
  const empty = items.length === 0;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-forest-950/50" onClick={() => setOpen(false)} aria-hidden />
      <aside role="dialog" aria-modal="true" aria-label={t.cart.title} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-2xl font-semibold text-forest-900">{t.cart.title}</h2>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={t.nav.close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-forest-50"><X className="h-5 w-5" /></button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-xl font-semibold text-forest-900">{t.cart.empty}</p>
            <p className="text-muted">{t.cart.emptyHint}</p>
            <Link href="/products" onClick={() => setOpen(false)} className="btn btn-primary mt-2">{t.cart.continueShopping}</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4" aria-busy={loading}>
              {failed && !data && (
                <div className="rounded-xl border border-danger/30 bg-[#fbeae6] p-4 text-sm text-danger">
                  <p className="font-semibold">{t.common.somethingWrong}</p>
                  <p>{t.common.somethingWrongHint}</p>
                  <button type="button" className="btn btn-outline mt-3 !min-h-9" onClick={() => load(new AbortController().signal)}>{t.common.retry}</button>
                </div>
              )}
              {!data && !failed && <div className="space-y-3" aria-hidden>{items.map((i) => <div key={`${i.productId}${i.variantId}`} className="skeleton h-24" />)}</div>}
              <ul className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                {data?.lines.map((line) => {
                  const src = imageUrl(line.imagePath);
                  const name = line.issue === "unavailable" ? "—" : lineName(line, lang);
                  const decrementTo = clampQuantity(line.quantity - line.step, { min: line.min, step: line.step, max: line.max });
                  const incrementTo = clampQuantity(line.quantity + line.step, { min: line.min, step: line.step, max: line.max });
                  return (
                    <li key={line.key} className={`card flex gap-3 p-3 ${line.issue ? "border-danger/50" : ""}`}>
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory">
                        {src ? <Image src={src} alt="" fill sizes="80px" className="object-cover" /> : <PlaceholderImage label="" className="[&_span]:hidden" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-semibold text-forest-900">{name}</p>
                        {line.issue ? (
                          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-danger"><AlertTriangle className="h-4 w-4" aria-hidden />{t.cart.issue[line.issue]}</p>
                        ) : (
                          <p className="text-sm text-muted">{unitPriceText(line, lang, symbol)}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {line.issue === "unavailable" || line.issue === "variant_unavailable" ? <span /> : (
                            <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label={lineQuantityText(line, lang)}>
                              <button type="button" aria-label={t.product.decrease} disabled={toMilli(line.quantity) <= toMilli(line.min)} onClick={() => setQuantity(line.productId, line.variantId, decrementTo)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest-50 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                              <span className="min-w-12 px-1 text-center text-sm font-semibold" aria-live="polite">{formatQuantity(line.quantity)}</span>
                              <button type="button" aria-label={t.product.increase} disabled={toMilli(line.quantity) >= toMilli(line.max)} onClick={() => setQuantity(line.productId, line.variantId, incrementTo)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-forest-50 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                            </div>
                          )}
                          <p className="font-semibold text-forest-900">{line.issue ? "" : formatMoney(line.linePaise, symbol)}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => remove(line.productId, line.variantId)} aria-label={`${t.cart.remove}: ${name}`} className="self-start rounded-full p-2 text-muted hover:bg-forest-50 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-3 border-t border-line bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">{t.cart.subtotal}</span>
                <span className="text-2xl font-semibold text-forest-900">{data ? formatMoney(data.subtotalPaise, symbol) : "—"}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted">{t.cart.note}</p>
              {data?.hasBlockingIssue && <p role="alert" className="text-sm font-semibold text-danger">{t.cart.fixIssues}</p>}
              {data && !data.whatsappConfigured && <p role="alert" className="text-sm font-semibold text-danger">{t.cart.notConfigured}</p>}
              {data?.whatsappUrl ? (
                <a href={data.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp w-full !text-base"><MessageCircle className="h-5 w-5" aria-hidden />{t.cart.continueToWhatsApp}</a>
              ) : (
                <button type="button" disabled className="btn btn-whatsapp w-full !text-base"><MessageCircle className="h-5 w-5" aria-hidden />{loading ? t.cart.updating : t.cart.continueToWhatsApp}</button>
              )}
              {confirmClear ? (
                <div className="flex items-center gap-2" role="alertdialog" aria-label={t.cart.clearConfirm}>
                  <p className="flex-1 text-sm">{t.cart.clearConfirm}</p>
                  <button type="button" className="btn btn-outline !min-h-9 !px-3 text-sm" onClick={() => setConfirmClear(false)}>{t.cart.cancel}</button>
                  <button type="button" className="btn btn-primary !min-h-9 !px-3 text-sm" onClick={() => { clear(); setConfirmClear(false); }}>{t.cart.confirmClear}</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmClear(true)} className="w-full text-center text-sm font-semibold text-muted underline underline-offset-4 hover:text-danger">{t.cart.clear}</button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
