"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem, Lang } from "@/lib/types";
import { dictionaries, type Dict } from "@/lib/i18n/dictionary";
import { LANG_COOKIE } from "@/lib/i18n/lang";
import { clampQuantity, type QuantityRule } from "@/lib/pricing";

/* ------------------------------------------------------------------ language */
interface LangCtx { lang: Lang; t: Dict; setLang: (l: Lang) => void; switching: boolean }
const LanguageContext = createContext<LangCtx | null>(null);

export function useLang(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside Providers");
  return ctx;
}

/* ---------------------------------------------------------------------- cart */
const CART_KEY = "nm_cart_v1";

interface CartCtx {
  items: CartItem[];
  count: number;
  hydrated: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem, rule: QuantityRule) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
  toast: string | null;
}
const CartContext = createContext<CartCtx | null>(null);

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside Providers");
  return ctx;
}

const same = (a: CartItem, productId: string, variantId: string | null) => a.productId === productId && a.variantId === variantId;

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i): i is CartItem =>
        typeof i === "object" && i !== null &&
        typeof (i as CartItem).productId === "string" &&
        (typeof (i as CartItem).variantId === "string" || (i as CartItem).variantId === null) &&
        typeof (i as CartItem).quantity === "number" && Number.isFinite((i as CartItem).quantity) && (i as CartItem).quantity > 0)
      .slice(0, 60);
  } catch {
    return [];
  }
}

export function Providers({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [switching, startTransition] = useTransition();

  const setLang = useCallback((next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    setLangState(next);
    startTransition(() => router.refresh());
  }, [router]);

  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Loading persisted cart after mount avoids server/client hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => { if (e.key === CART_KEY) setItems(readStoredCart()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage may be blocked */ }
  }, [items, hydrated]);

  const t = dictionaries[lang];

  const add = useCallback((item: CartItem, rule: QuantityRule) => {
    setItems((prev) => {
      const existing = prev.find((i) => same(i, item.productId, item.variantId));
      if (existing) {
        const quantity = clampQuantity(existing.quantity + item.quantity, rule);
        return prev.map((i) => (i === existing ? { ...i, quantity } : i));
      }
      return [...prev, { ...item, quantity: clampQuantity(item.quantity, rule) }];
    });
    setToast(dictionaries[lang].common.added);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, [lang]);

  const setQuantity = useCallback((productId: string, variantId: string | null, quantity: number) => {
    setItems((prev) => prev.map((i) => (same(i, productId, variantId) ? { ...i, quantity } : i)));
  }, []);
  const remove = useCallback((productId: string, variantId: string | null) => {
    setItems((prev) => prev.filter((i) => !same(i, productId, variantId)));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const langValue = useMemo(() => ({ lang, t, setLang, switching }), [lang, t, setLang, switching]);
  const cartValue = useMemo<CartCtx>(() => ({
    items, count: items.length, hydrated, isOpen, setOpen, add, setQuantity, remove, clear, toast,
  }), [items, hydrated, isOpen, add, setQuantity, remove, clear, toast]);

  return (
    <LanguageContext.Provider value={langValue}>
      <CartContext.Provider value={cartValue}>
        {children}
        <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
          {toast && (
            <div className="rise-in rounded-full bg-forest-900 px-5 py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-lift)]">{toast}</div>
          )}
        </div>
      </CartContext.Provider>
    </LanguageContext.Provider>
  );
}
