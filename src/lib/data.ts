import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import type { Category, Lang, Product, SiteSettings } from "./types";
import { getAdminDb, isAdminConfigured } from "./firebase/admin";
import { displayPrice } from "./product-utils";
import { LANG_COOKIE, isLang } from "./i18n/lang";

export const PAGE_SIZE = 12;

export const DEFAULT_SETTINGS: SiteSettings = {
  business_name_en: "Nilaamudhu Traditional Products",
  business_name_ta: "நிலாமுது",
  tagline_en: "From our soil to your home",
  tagline_ta: "எங்கள் மண்ணில் இருந்து உங்கள் இல்லத்துக்கு",
  announcement_en: null,
  announcement_ta: null,
  about_en: null,
  about_ta: null,
  quality_en: null,
  quality_ta: null,
  whatsapp_number: null,
  contact_phone: null,
  contact_email: null,
  address_en: null,
  address_ta: null,
  instagram_url: null,
  facebook_url: null,
  currency_symbol: "₹",
  default_language: "en",
};

export function mapDocToProduct(doc: FirebaseFirestore.DocumentSnapshot): Product {
  const data = doc.data() || {};
  return {
    id: doc.id,
    slug: data.slug || doc.id,
    category_id: data.category_id ?? null,
    name_en: data.name_en || "",
    name_ta: data.name_ta ?? null,
    short_description_en: data.short_description_en ?? null,
    short_description_ta: data.short_description_ta ?? null,
    description_en: data.description_en ?? null,
    description_ta: data.description_ta ?? null,
    ingredients_en: data.ingredients_en ?? null,
    ingredients_ta: data.ingredients_ta ?? null,
    storage_en: data.storage_en ?? null,
    storage_ta: data.storage_ta ?? null,
    price: data.price !== undefined && data.price !== null ? Number(data.price) : null,
    pricing_unit: data.pricing_unit || "kg",
    min_quantity: Number(data.min_quantity ?? 1),
    quantity_step: Number(data.quantity_step ?? 1),
    max_quantity: Number(data.max_quantity ?? 50),
    stock_status: data.stock_status || "in_stock",
    status: data.status || "draft",
    is_featured: Boolean(data.is_featured),
    sort_order: Number(data.sort_order ?? 0),
    updated_at: data.updated_at
      ? typeof data.updated_at.toDate === "function"
        ? data.updated_at.toDate().toISOString()
        : String(data.updated_at)
      : new Date().toISOString(),
    product_images: Array.isArray(data.images)
      ? data.images
      : Array.isArray(data.product_images)
      ? data.product_images
      : [],
    product_variants: Array.isArray(data.variants)
      ? data.variants
      : Array.isArray(data.product_variants)
      ? data.product_variants
      : [],
    categories: data.categories ?? null,
  };
}

export const getSettings = cache(
  unstable_cache(
    async (): Promise<SiteSettings> => {
      if (!isAdminConfigured()) return DEFAULT_SETTINGS;
      try {
        const db = getAdminDb();
        if (!db) return DEFAULT_SETTINGS;
        const doc = await db.collection("settings").doc("site").get();
        if (!doc.exists) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...doc.data() } as SiteSettings;
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    ["site-settings"],
    { tags: ["settings"], revalidate: 3600 }
  )
);

export const getLang = cache(async (): Promise<Lang> => {
  const stored = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(stored)) return stored;
  return (await getSettings()).default_language;
});

export const getCategories = cache(
  unstable_cache(
    async (): Promise<Category[]> => {
      if (!isAdminConfigured()) return [];
      try {
        const db = getAdminDb();
        if (!db) return [];
        const snap = await db.collection("categories").where("is_active", "==", true).get();
        const categories: Category[] = snap.docs.map((d) => {
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
        });
        return categories.sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
      } catch {
        return [];
      }
    },
    ["active-categories"],
    { tags: ["categories"], revalidate: 3600 }
  )
);

export type SortKey = "default" | "price_asc" | "price_desc";

export function sanitizeSearch(q: string): string {
  return q.replace(/[,()%*\\_:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export async function getProducts(opts: {
  q?: string;
  categorySlug?: string;
  sort?: SortKey;
  page?: number;
}): Promise<{
  products: Product[];
  total: number;
  page: number;
  pageCount: number;
  error: boolean;
}> {
  const page = Math.max(1, opts.page ?? 1);
  if (!isAdminConfigured()) return { products: [], total: 0, page, pageCount: 1, error: false };
  try {
    const db = getAdminDb();
    if (!db) return { products: [], total: 0, page, pageCount: 1, error: false };

    let categoryId: string | null = null;
    if (opts.categorySlug) {
      const cats = await getCategories();
      const matched = cats.find((c) => c.slug === opts.categorySlug);
      if (!matched) return { products: [], total: 0, page, pageCount: 1, error: false };
      categoryId = matched.id;
    }

    let query: FirebaseFirestore.Query = db.collection("products").where("status", "==", "active");
    if (categoryId) {
      query = query.where("category_id", "==", categoryId);
    }

    const snap = await query.get();
    let all: Product[] = snap.docs.map(mapDocToProduct);

    // Populate category info
    const categories = await getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c]));
    all.forEach((p) => {
      if (p.category_id && catMap.has(p.category_id)) {
        const c = catMap.get(p.category_id)!;
        p.categories = { id: c.id, slug: c.slug, name_en: c.name_en, name_ta: c.name_ta };
      }
    });

    const q = sanitizeSearch(opts.q ?? "").toLowerCase();
    if (q) {
      all = all.filter(
        (p) =>
          (p.name_en && p.name_en.toLowerCase().includes(q)) ||
          (p.name_ta && p.name_ta.toLowerCase().includes(q)) ||
          (p.short_description_en && p.short_description_en.toLowerCase().includes(q)) ||
          (p.short_description_ta && p.short_description_ta.toLowerCase().includes(q))
      );
    }

    const sort = opts.sort ?? "default";
    if (sort === "price_asc") {
      all.sort(
        (a, b) =>
          (displayPrice(a)?.paise ?? Number.MAX_SAFE_INTEGER) -
          (displayPrice(b)?.paise ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === "price_desc") {
      all.sort(
        (a, b) =>
          (displayPrice(b)?.paise ?? Number.MIN_SAFE_INTEGER) -
          (displayPrice(a)?.paise ?? Number.MIN_SAFE_INTEGER)
      );
    } else {
      all.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.name_en.localeCompare(b.name_en);
      });
    }

    const total = all.length;
    const from = (page - 1) * PAGE_SIZE;
    const paginated = all.slice(from, from + PAGE_SIZE);

    return {
      products: paginated,
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      error: false,
    };
  } catch {
    return { products: [], total: 0, page, pageCount: 1, error: true };
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  return unstable_cache(
    async (s: string): Promise<Product | null> => {
      if (!isAdminConfigured()) return null;
      try {
        const db = getAdminDb();
        if (!db) return null;
        const snap = await db
          .collection("products")
          .where("slug", "==", s)
          .where("status", "==", "active")
          .limit(1)
          .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const product = mapDocToProduct(doc);
        if (product.category_id) {
          const categories = await getCategories();
          const matched = categories.find((c) => c.id === product.category_id);
          if (matched) {
            product.categories = {
              id: matched.id,
              slug: matched.slug,
              name_en: matched.name_en,
              name_ta: matched.name_ta,
            };
          }
        }
        return product;
      } catch {
        return null;
      }
    },
    [`product-${slug}`],
    { tags: ["products", `product-${slug}`], revalidate: 3600 }
  )(slug);
});

export const getFeaturedProducts = cache(async (limit = 8): Promise<Product[]> => {
  return unstable_cache(
    async (lim: number): Promise<Product[]> => {
      if (!isAdminConfigured()) return [];
      try {
        const db = getAdminDb();
        if (!db) return [];
        const snap = await db
          .collection("products")
          .where("status", "==", "active")
          .where("is_featured", "==", true)
          .limit(lim)
          .get();
        const list = snap.docs.map(mapDocToProduct);
        list.sort((a, b) => a.sort_order - b.sort_order);
        return list;
      } catch {
        return [];
      }
    },
    [`featured-products-${limit}`],
    { tags: ["products", "featured"], revalidate: 3600 }
  )(limit);
});

export const getRelatedProducts = cache(async (product: Product, limit = 4): Promise<Product[]> => {
  if (!isAdminConfigured() || !product.category_id) return [];
  const categoryId = product.category_id;
  const productId = product.id;
  return unstable_cache(
    async (catId: string, currentId: string, lim: number): Promise<Product[]> => {
      try {
        const db = getAdminDb();
        if (!db) return [];
        const snap = await db
          .collection("products")
          .where("status", "==", "active")
          .where("category_id", "==", catId)
          .limit(lim + 1)
          .get();
        return snap.docs
          .map(mapDocToProduct)
          .filter((p) => p.id !== currentId)
          .slice(0, lim);
      } catch {
        return [];
      }
    },
    [`related-${categoryId}-${productId}-${limit}`],
    { tags: ["products"], revalidate: 3600 }
  )(categoryId, productId, limit);
});

export async function getProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  const map = new Map<string, Product>();
  if (!isAdminConfigured() || ids.length === 0) return map;
  try {
    const db = getAdminDb();
    if (!db) return map;
    const refs = ids.map((id) => db.collection("products").doc(id));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) {
        const p = mapDocToProduct(snap);
        if (p.status === "active") {
          map.set(p.id, p);
        }
      }
    }
    return map;
  } catch {
    return map;
  }
}

export async function getAllActiveSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isAdminConfigured()) return [];
  try {
    const db = getAdminDb();
    if (!db) return [];
    const snap = await db.collection("products").where("status", "==", "active").get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        slug: data.slug || d.id,
        updated_at: data.updated_at
          ? typeof data.updated_at.toDate === "function"
            ? data.updated_at.toDate().toISOString()
            : String(data.updated_at)
          : new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

