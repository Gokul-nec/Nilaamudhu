import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

const decimalString = (message: string) =>
  z.string().trim().refine((v) => v === "" || /^\d{1,7}(\.\d{1,3})?$/.test(v), message);

const slugSchema = z.string().trim().min(1, "Slug is required").max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

const imagePathSchema = z.string().trim().min(1).max(1000)
  .refine((v) => !v.includes(".."), "Invalid image path");

export const stockStatusSchema = z.enum(["in_stock", "limited", "out_of_stock"]);
export const pricingUnitSchema = z.enum(["kg", "g", "litre", "piece", "pack"]);

// ---------------------------------------------------------------- public cart API
export const cartRequestSchema = z.object({
  lang: z.enum(["en", "ta"]).default("en"),
  items: z.array(z.object({
    productId: z.string().min(1).max(128),
    variantId: z.string().min(1).max(128).nullable(),
    quantity: z.number().finite().positive().max(10000),
  })).max(60),
});

// ---------------------------------------------------------------- admin: product
export const variantFormSchema = z.object({
  id: z.string().min(1).max(128).optional(),
  label_en: z.string().trim().min(1, "English label is required").max(80),
  label_ta: optionalText(80),
  price: decimalString("Enter a valid price").refine((v) => v !== "", "Price is required"),
  stock_status: stockStatusSchema,
  is_active: z.boolean(),
});

export const imageFormSchema = z.object({
  id: z.string().min(1).max(128).optional(),
  path: imagePathSchema,
  alt_en: optionalText(200),
  alt_ta: optionalText(200),
});

export const productFormSchema = z.object({
  name_en: z.string().trim().min(1, "English name is required").max(160),
  name_ta: optionalText(160),
  slug: slugSchema,
  category_id: z.string().min(1).max(128).nullable().or(z.literal("").transform(() => null)),
  short_description_en: optionalText(300),
  short_description_ta: optionalText(300),
  description_en: optionalText(5000),
  description_ta: optionalText(5000),
  ingredients_en: optionalText(1000),
  ingredients_ta: optionalText(1000),
  storage_en: optionalText(1000),
  storage_ta: optionalText(1000),
  price: decimalString("Enter a valid price"),
  pricing_unit: pricingUnitSchema,
  min_quantity: decimalString("Enter a valid number").refine((v) => v !== "" && Number(v) > 0, "Must be greater than 0"),
  quantity_step: decimalString("Enter a valid number").refine((v) => v !== "" && Number(v) > 0, "Must be greater than 0"),
  max_quantity: decimalString("Enter a valid number").refine((v) => v !== "" && Number(v) > 0, "Must be greater than 0"),
  stock_status: stockStatusSchema,
  status: z.enum(["draft", "active", "archived"]),
  is_featured: z.boolean(),
  sort_order: z.string().trim().refine((v) => /^-?\d{1,6}$/.test(v), "Whole number"),
  variants: z.array(variantFormSchema).max(20),
  images: z.array(imageFormSchema).max(10),
}).superRefine((val, ctx) => {
  const hasActiveVariant = val.variants.some((v) => v.is_active);
  if (!hasActiveVariant && val.price === "") {
    ctx.addIssue({ code: "custom", path: ["price"], message: "Enter a price, or add a package size" });
  }
  if (Number(val.min_quantity) > Number(val.max_quantity)) {
    ctx.addIssue({ code: "custom", path: ["max_quantity"], message: "Must be at least the minimum quantity" });
  }
});
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

// ---------------------------------------------------------------- admin: category
export const categoryFormSchema = z.object({
  name_en: z.string().trim().min(1, "English name is required").max(120),
  name_ta: optionalText(120),
  slug: slugSchema,
  sort_order: z.string().trim().refine((v) => /^-?\d{1,6}$/.test(v), "Whole number"),
  is_active: z.boolean(),
  image_path: imagePathSchema.nullable().optional().or(z.literal("")).transform((v) => v || null),
});
export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormOutput = z.output<typeof categoryFormSchema>;

// ---------------------------------------------------------------- admin: settings
const optionalUrl = z.string().trim().max(300).optional().transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "Must start with http:// or https://");

export const settingsFormSchema = z.object({
  business_name_en: z.string().trim().min(1, "Required").max(120),
  business_name_ta: z.string().trim().min(1, "Required").max(120),
  tagline_en: optionalText(200),
  tagline_ta: optionalText(200),
  announcement_en: optionalText(200),
  announcement_ta: optionalText(200),
  about_en: optionalText(3000),
  about_ta: optionalText(3000),
  quality_en: optionalText(3000),
  quality_ta: optionalText(3000),
  whatsapp_number: z.string().trim().optional()
    .transform((v) => (v ?? "").replace(/[\s\-+()]/g, ""))
    .refine((v) => v === "" || /^[0-9]{8,15}$/.test(v), "Digits only with country code, e.g. 919876543210")
    .transform((v) => (v === "" ? null : v)),
  contact_phone: optionalText(40),
  contact_email: z.string().trim().max(160).optional()
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "Enter a valid email")
    .transform((v) => (v ? v : null)),
  address_en: optionalText(400),
  address_ta: optionalText(400),
  instagram_url: optionalUrl,
  facebook_url: optionalUrl,
  currency_symbol: z.string().trim().min(1, "Required").max(5),
  default_language: z.enum(["en", "ta"]),
});
export type SettingsFormInput = z.input<typeof settingsFormSchema>;
export type SettingsFormOutput = z.output<typeof settingsFormSchema>;
