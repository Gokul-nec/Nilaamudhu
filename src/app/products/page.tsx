import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getLang, getProducts, getSettings, type SortKey } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Breadcrumbs } from "@/components/ui";

type SP = Promise<{ q?: string; category?: string; sort?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = await searchParams;
  const lang = await getLang();
  const title = q ? `${dictionaries[lang].shop.searchResults} ${q.slice(0, 40)}` : dictionaries[lang].shop.title;
  return { title, alternates: { canonical: "/products" }, robots: q ? { index: false, follow: true } : undefined };
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sort: SortKey = sp.sort === "price_asc" || sp.sort === "price_desc" ? sp.sort : "default";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [lang, settings, categories, productsRes] = await Promise.all([
    getLang(),
    getSettings(),
    getCategories(),
    getProducts({ q: sp.q, categorySlug: sp.category, sort, page }),
  ]);
  const t = dictionaries[lang];
  const { products, total, pageCount, error } = productsRes;
  const filtered = Boolean(sp.q || sp.category);
  const activeCategory = categories.find((c) => c.slug === sp.category);

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (sp.q) qs.set("q", sp.q);
    if (sp.category) qs.set("category", sp.category);
    if (sort !== "default") qs.set("sort", sort);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/products?${s}` : "/products";
  };

  const pageTitle = sp.q
    ? `${t.shop.searchResults} “${sp.q.slice(0, 40)}”`
    : activeCategory
    ? pick(lang, activeCategory.name_en, activeCategory.name_ta).text
    : t.shop.title;

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: t.nav.home, href: "/" },
          { label: t.shop.title, href: activeCategory ? "/products" : undefined },
          ...(activeCategory ? [{ label: pick(lang, activeCategory.name_en, activeCategory.name_ta).text }] : []),
        ]}
      />

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl md:text-5xl">{pageTitle}</h1>
        <p className="text-sm font-medium text-[var(--color-muted)]" aria-live="polite">
          {total} {t.shop.results}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-ivory)]/70 p-4 shadow-sm sm:p-5">
        <ProductFilters categories={categories} />
      </div>

      {error ? (
        <div className="card mt-8 p-10 text-center" role="alert">
          <p className="text-xl font-semibold text-[var(--color-forest-900)]">{t.common.somethingWrong}</p>
          <p className="mt-1 text-[var(--color-muted)]">{t.common.somethingWrongHint}</p>
          <Link href={pageHref(page)} className="btn btn-primary mt-5">{t.common.retry}</Link>
        </div>
      ) : products.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-xl font-semibold text-[var(--color-forest-900)]">{filtered ? t.shop.noResults : t.shop.noProductsYet}</p>
          <p className="mt-1 text-[var(--color-muted)]">{filtered ? t.shop.noResultsHint : t.shop.noProductsYetHint}</p>
          {filtered && <Link href="/products" className="btn btn-outline mt-5">{t.shop.clearFilters}</Link>}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} lang={lang} currency={settings.currency_symbol} priority={i < 4} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn btn-outline" rel="prev">{t.common.previous}</Link>
          ) : (
            <span className="btn btn-outline opacity-40 cursor-not-allowed" aria-disabled="true">{t.common.previous}</span>
          )}
          <span className="text-sm font-semibold text-[var(--color-muted)]">
            {t.common.page} {page} {t.common.of} {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} className="btn btn-outline" rel="next">{t.common.next}</Link>
          ) : (
            <span className="btn btn-outline opacity-40 cursor-not-allowed" aria-disabled="true">{t.common.next}</span>
          )}
        </nav>
      )}
    </div>
  );
}
