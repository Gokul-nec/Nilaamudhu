import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";
import { getLang, mapDocToProduct } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import type { ProductFormInput } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit product" };

const str = (v: string | null) => v ?? "";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();

  const [{ db }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const pf = dictionaries[lang].admin.productForm;

  const [productDoc, categoriesSnap] = await Promise.all([
    db.collection("products").doc(id).get(),
    db.collection("categories").get(),
  ]);

  if (!productDoc.exists) notFound();
  const p: Product = mapDocToProduct(productDoc);

  const categories = categoriesSnap.docs
    .map((d) => ({
      id: d.id,
      name_en: d.data().name_en || "",
      name_ta: d.data().name_ta ? String(d.data().name_ta) : null,
      sort_order: Number(d.data().sort_order ?? 0),
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));

  const initial: ProductFormInput = {
    name_en: p.name_en,
    name_ta: str(p.name_ta),
    slug: p.slug,
    category_id: p.category_id,
    short_description_en: str(p.short_description_en),
    short_description_ta: str(p.short_description_ta),
    description_en: str(p.description_en),
    description_ta: str(p.description_ta),
    ingredients_en: str(p.ingredients_en),
    ingredients_ta: str(p.ingredients_ta),
    storage_en: str(p.storage_en),
    storage_ta: str(p.storage_ta),
    price: p.price === null ? "" : String(p.price),
    pricing_unit: p.pricing_unit,
    min_quantity: String(p.min_quantity),
    quantity_step: String(p.quantity_step),
    max_quantity: String(p.max_quantity),
    stock_status: p.stock_status,
    status: p.status,
    is_featured: p.is_featured,
    sort_order: String(p.sort_order),
    variants: [...(p.product_variants ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        label_en: v.label_en,
        label_ta: str(v.label_ta),
        price: String(v.price),
        stock_status: v.stock_status,
        sort_order: String(v.sort_order),
        is_active: v.is_active,
      })),
    images: [...(p.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({
        path: i.path,
        alt_en: str(i.alt_en),
        alt_ta: str(i.alt_ta),
        sort_order: String(i.sort_order),
      })),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold text-forest-900">{pf.editTitle}</h1>
      <p className="text-muted">{pf.subtitle}</p>
      <ProductForm productId={p.id} initial={initial} categories={categories} />
    </div>
  );
}
