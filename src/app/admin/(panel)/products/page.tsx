import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { StatusButtons } from "@/components/admin/StatusButtons";
import type { Product } from "@/lib/types";
import { mapDocToProduct } from "@/lib/data";
import { displayPrice } from "@/lib/product-utils";
import { formatMoney } from "@/lib/pricing";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { db } = await requireAdmin();

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
    { v: undefined, l: "All" },
    { v: "active", l: "Active" },
    { v: "draft", l: "Inactive" },
    { v: "archived", l: "Archived" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold text-forest-900">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>
      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.l}
            href={t.v ? `/admin/products?status=${t.v}` : "/admin/products"}
            aria-current={status === t.v || (!status && !t.v) ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 font-semibold ${
              status === t.v || (!status && !t.v)
                ? "bg-forest-800 text-cream"
                : "bg-white text-forest-800 ring-1 ring-line hover:bg-forest-50"
            }`}
          >
            {t.l}
          </Link>
        ))}
      </nav>
      {products.length === 0 ? (
        <p className="card p-8 text-center text-muted">No products here yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="bg-ivory text-sm">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const price = displayPrice(p);
                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-semibold text-forest-900 hover:underline"
                      >
                        {p.name_en}
                      </Link>
                      {p.name_ta && (
                        <div className="text-sm text-muted" lang="ta">
                          {p.name_ta}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-muted">{p.categories?.name_en ?? "—"}</td>
                    <td className="p-3">
                      {price ? `${price.isFrom ? "from " : ""}${formatMoney(price.paise)}` : "—"}
                    </td>
                    <td className="p-3">{p.stock_status.replaceAll("_", " ")}</td>
                    <td className="p-3 capitalize">
                      {p.status === "draft" ? "inactive" : p.status}
                      {p.is_featured ? " · featured" : ""}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-sm font-semibold text-forest-800 underline underline-offset-4"
                        >
                          Edit
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
