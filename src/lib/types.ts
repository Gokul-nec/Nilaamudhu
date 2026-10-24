export type Lang = "en" | "ta";
export type PricingUnit = "kg" | "g" | "litre" | "piece" | "pack";
export type StockStatus = "in_stock" | "limited" | "out_of_stock";
export type ProductStatus = "draft" | "active" | "archived";

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ta: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  path: string;
  alt_en: string | null;
  alt_ta: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  label_en: string;
  label_ta: string | null;
  price: number;
  stock_status: StockStatus;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  category_id: string | null;
  name_en: string;
  name_ta: string | null;
  short_description_en: string | null;
  short_description_ta: string | null;
  description_en: string | null;
  description_ta: string | null;
  ingredients_en: string | null;
  ingredients_ta: string | null;
  storage_en: string | null;
  storage_ta: string | null;
  price: number | null;
  pricing_unit: PricingUnit;
  min_quantity: number;
  quantity_step: number;
  max_quantity: number;
  stock_status: StockStatus;
  status: ProductStatus;
  is_featured: boolean;
  sort_order: number;
  updated_at: string;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: Pick<Category, "id" | "slug" | "name_en" | "name_ta"> | null;
}

export interface SiteSettings {
  business_name_en: string;
  business_name_ta: string;
  tagline_en: string | null;
  tagline_ta: string | null;
  announcement_en: string | null;
  announcement_ta: string | null;
  about_en: string | null;
  about_ta: string | null;
  quality_en: string | null;
  quality_ta: string | null;
  whatsapp_number: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address_en: string | null;
  address_ta: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  currency_symbol: string;
  default_language: Lang;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export type CartIssueCode =
  | "unavailable"
  | "variant_unavailable"
  | "no_price"
  | "out_of_stock"
  | "invalid_quantity";

export interface PricedLine {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name_en: string;
  name_ta: string | null;
  variantLabel_en: string | null;
  variantLabel_ta: string | null;
  imagePath: string | null;
  unit: PricingUnit;
  unitPricePaise: number;
  quantity: number;
  step: number;
  min: number;
  max: number;
  linePaise: number;
  stock: StockStatus;
  issue: CartIssueCode | null;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalPaise: number;
  hasBlockingIssue: boolean;
  orderableCount: number;
}
