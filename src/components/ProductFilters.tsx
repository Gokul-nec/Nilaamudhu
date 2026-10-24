"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { useLang } from "./Providers";
import { pick } from "@/lib/i18n/lang";

export function ProductFilters({ categories }: { categories: { slug: string; name_en: string; name_ta: string | null }[] }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const go = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <form
      role="search"
      aria-label={t.shop.filters}
      onSubmit={(e) => {
        e.preventDefault();
        go({ q: q.trim() || null });
      }}
      className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
    >
      <div className="relative">
        <label htmlFor="shop-q" className="sr-only">{t.nav.search}</label>
        <input
          id="shop-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.nav.searchPlaceholder}
          maxLength={60}
          className="field !rounded-full !border-[var(--color-line)] bg-white pr-11 shadow-sm placeholder:text-[var(--color-muted)]/70"
        />
        <button
          type="submit"
          aria-label={t.nav.search}
          className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--color-forest-800)] hover:bg-[var(--color-forest-50)]"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div>
        <label htmlFor="shop-cat" className="sr-only">{t.shop.category}</label>
        <select
          id="shop-cat"
          className="field sm:min-w-52 !rounded-full !border-[var(--color-line)] bg-white shadow-sm font-medium text-[var(--color-ink)]"
          value={params.get("category") ?? ""}
          onChange={(e) => go({ category: e.target.value || null })}
        >
          <option value="">{t.shop.allCategories}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {pick(lang, c.name_en, c.name_ta).text}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shop-sort" className="sr-only">{t.shop.sort}</label>
        <select
          id="shop-sort"
          className="field sm:min-w-52 !rounded-full !border-[var(--color-line)] bg-white shadow-sm font-medium text-[var(--color-ink)]"
          value={params.get("sort") ?? ""}
          onChange={(e) => go({ sort: e.target.value || null })}
        >
          <option value="">{t.shop.sortDefault}</option>
          <option value="price_asc">{t.shop.sortPriceAsc}</option>
          <option value="price_desc">{t.shop.sortPriceDesc}</option>
        </select>
      </div>
    </form>
  );
}
