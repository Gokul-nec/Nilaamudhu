import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { StatusButtons } from "@/components/admin/StatusButtons";
import type { Product } from "@/lib/types";
import { getLang, mapDocToProduct } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { displayPrice } from "@/lib/product-utils";
import { formatMoney } from "@/lib/pricing";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const [{ db }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const t = dictionaries[lang].admin.products;

  let productsQuery: FirebaseFirestore.Query = db.collection("products");
  if (status === "active" || status === "draft" || status === "archived") {
    productsQuery = productsQuery.where("status", "==", status);
  }

  const [productsSnap, categoriesSnap] = await Promise.all([
    productsQuery.get(),
    db.collection("categories").get(),
  ]);

  const catMap = new Map(
    categoriesSnap.docs.map((d) => [
      d.id,
      {
        id: d.id,
        slug: d.data().slug || d.id,
        name_en: String(d.data().name_en || ""),
        name_ta: d.data().name_ta ? String(d.data().name_ta) : null,
      },
    ])
  );

  const products: Product[] = productsSnap.docs
    .map(mapDocToProduct)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map((p) => ({
      ...p,
      categories: p.category_id && catMap.has(p.category_id) ? catMap.get(p.category_id)! : null,
    }));

  const tabs = [
    { v: undefined, l: t.tabs.all },
    { v: "active", l: t.tabs.active },
    { v: "draft", l: t.tabs.draft },
    { v: "archived", l: t.tabs.archived },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold text-forest-900">{t.title}</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          {t.addProduct}
        </Link>
      </div>
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.l}
            href={tab.v ? `/admin/products?status=${tab.v}` : "/admin/products"}
            aria-current={status === tab.v || (!status && !tab.v) ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 font-semibold ${
              status === tab.v || (!status && !tab.v)
                ? "bg-forest-800 text-cream"
                : "bg-white text-forest-800 ring-1 ring-line hover:bg-forest-50"
            }`}
          >
            {tab.l}
          </Link>
        ))}
      </nav>
      {products.length === 0 ? (
        <p className="card p-8 text-center text-muted">{t.noProducts}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="bg-ivory text-sm">
              <tr>
                <th className="p-3">{t.table.product}</th>
                <th className="p-3">{t.table.category}</th>
                <th className="p-3">{t.table.price}</th>
                <th className="p-3">{t.table.stock}</th>
                <th className="p-3">{t.table.status}</th>
                <th className="p-3">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const price = displayPrice(p);
                const primaryName = pick(lang, p.name_en, p.name_ta).text;
                const secondaryName = lang === "ta" ? p.name_en : p.name_ta;
                const categoryName = p.categories ? pick(lang, p.categories.name_en, p.categories.name_ta).text : "—";
                const stockLabel = t.status[p.stock_status] ?? p.stock_status.replaceAll("_", " ");
                const statusLabel = (t.status[p.status] ?? p.status) + (p.is_featured ? ` · ${t.table.featured}` : "");

                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-semibold text-forest-900 hover:underline"
                      >
                        {primaryName}
                      </Link>
                      {secondaryName && (
                        <div className="text-sm text-muted">
                          {secondaryName}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-muted">{categoryName}</td>
                    <td className="p-3">
                      {price ? `${price.isFrom ? t.table.from : ""}${formatMoney(price.paise)}` : "—"}
                    </td>
                    <td className="p-3">{stockLabel}</td>
                    <td className="p-3 capitalize">{statusLabel}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-sm font-semibold text-forest-800 underline underline-offset-4"
                        >
                          {t.table.edit}
                        </Link>
                        <StatusButtons id={p.id} status={p.status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
