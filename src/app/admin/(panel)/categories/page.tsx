import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { CategoryManager, type CategoryRow } from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategories() {
  const { db } = await requireAdmin();
  const snap = await db.collection("categories").get();
  const categories: CategoryRow[] = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: data.slug || d.id,
        name_en: data.name_en || "",
        name_ta: data.name_ta ?? null,
        image_path: data.image_path ?? null,
        sort_order: Number(data.sort_order ?? 0),
        is_active: data.is_active !== false,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold text-forest-900">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
