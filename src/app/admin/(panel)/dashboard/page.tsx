import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getLang, mapDocToProduct } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";

export default async function DashboardPage() {
  const [{ db }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const t = dictionaries[lang].admin;

  const [productsSnap, categoriesSnap, settingsDoc] = await Promise.all([
    db.collection("products").get(),
    db.collection("categories").get(),
    db.collection("settings").doc("site").get(),
  ]);

  const allProducts = productsSnap.docs.map(mapDocToProduct);
  const total = allProducts.filter((p) => p.status !== "archived").length;
  const active = allProducts.filter((p) => p.status === "active").length;
  const inactive = allProducts.filter((p) => p.status === "draft").length;
  const outOfStock = allProducts.filter((p) => p.status === "active" && p.stock_status === "out_of_stock").length;
  const categories = categoriesSnap.size;

  const recent = [...allProducts]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const settingsData = settingsDoc.data();
  const whatsappNumber = settingsData?.whatsapp_number;

  const stats = [
    { label: t.dashboard.stats.total, value: total },
    { label: t.dashboard.stats.active, value: active },
    { label: t.dashboard.stats.draft, value: inactive },
    { label: t.dashboard.stats.outOfStock, value: outOfStock },
    { label: t.dashboard.stats.categories, value: categories },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold text-forest-900">{t.dashboard.title}</h1>
      {!whatsappNumber && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-gold-500 bg-[#fbeccb] p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
          <p>
            {t.dashboard.whatsappMissing}{" "}
            <Link href="/admin/settings" className="font-semibold underline">
              {t.dashboard.settingsLink}
            </Link>
            {t.dashboard.whatsappMissingSuffix}
          </p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="font-display mt-1 text-4xl font-semibold text-forest-900">{s.value}</dd>
          </div>
        ))}
      </dl>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-forest-900">{t.dashboard.recent}</h2>
          <Link href="/admin/products/new" className="btn btn-primary">
            {t.dashboard.addProduct}
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="card divide-y divide-line">
            {recent.map((p) => {
              const name = pick(lang, p.name_en, p.name_ta).text;
              const statusText = t.products.status[p.status] ?? p.status;
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="font-semibold hover:underline">
                    {name}
                  </Link>
                  <span className="text-sm text-muted">
                    {statusText} · {new Date(p.updated_at).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN")}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="card p-6 text-muted">{t.dashboard.noProducts}</p>
        )}
      </section>
    </div>
  );
}
