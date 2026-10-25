import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductFormInput } from "@/lib/validation";
import { getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Add product" };

const emptyProduct: ProductFormInput = {
  name_en: "",
  name_ta: "",
  slug: "",
  category_id: null,
  short_description_en: "",
  short_description_ta: "",
  description_en: "",
  description_ta: "",
  ingredients_en: "",
  ingredients_ta: "",
  storage_en: "",
  storage_ta: "",
  price: "",
  pricing_unit: "kg",
  min_quantity: "0.5",
  quantity_step: "0.5",
  max_quantity: "25",
  stock_status: "in_stock",
  status: "draft",
  is_featured: false,
  sort_order: "0",
  variants: [],
  images: [],
};

export default async function NewProductPage() {
  const [{ db }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const pf = dictionaries[lang].admin.productForm;

  const snap = await db.collection("categories").get();
  const categories = snap.docs
    .map((d) => ({
      id: d.id,
      name_en: d.data().name_en || "",
      name_ta: d.data().name_ta ? String(d.data().name_ta) : null,
      sort_order: Number(d.data().sort_order ?? 0),
    }))
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold text-forest-900">{pf.addTitle}</h1>
      <p className="text-muted">{pf.subtitle}</p>
      <ProductForm productId={null} initial={emptyProduct} categories={categories} />
    </div>
  );
}
