"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { productFormSchema, type ProductFormInput, type ProductFormOutput } from "@/lib/validation";
import { saveProductAction, uploadImageAction } from "@/app/admin/actions";
import { imageUrl, slugify } from "@/lib/product-utils";
import { useLang } from "@/components/Providers";
import { pick } from "@/lib/i18n/lang";

export interface CategoryOption {
  id: string;
  name_en: string;
  name_ta?: string | null;
}

function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: FieldError | { message?: string };
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {error?.message && <p role="alert" className="mt-1 text-sm text-danger">{error.message}</p>}
    </div>
  );
}

export function ProductForm({
  productId,
  initial,
  categories,
}: {
  productId: string | null;
  initial: ProductFormInput;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { lang, t } = useLang();
  const pf = t.admin.productForm;
  const [serverError, setServerError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(productId));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initial,
  });

  const variants = useFieldArray({ control, name: "variants" });
  const images = useFieldArray({ control, name: "images" });
  const watchedImages = watch("images");
  const hasActiveVariant = watch("variants").some((v) => v.is_active);

  const onSubmit = async () => {
    setServerError(null);
    const res = await saveProductAction(getValues(), productId);
    if (!res.ok) {
      setServerError(res.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageAction(formData, "products");
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!res.ok) {
      setUploadError(res.error);
      return;
    }

    images.append({ path: res.url, alt_en: "", alt_ta: "" });
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    images.append({ path: trimmed, alt_en: "", alt_ta: "" });
    setNewImageUrl("");
  };

  const nameReg = register("name_en", {
    onChange: (e) => {
      if (!slugTouched.current) setValue("slug", slugify(e.target.value), { shouldValidate: false });
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <p role="alert" className="rounded-xl bg-[#f6dcd6] p-3 font-semibold text-danger">
          {serverError}
        </p>
      )}

      <section className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-forest-900">Names</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product name (English) *" htmlFor="name_en" error={errors.name_en}>
            <input id="name_en" className="field" aria-invalid={!!errors.name_en} {...nameReg} />
          </Field>
          <Field
            label="Product name (Tamil)"
            htmlFor="name_ta"
            hint="Leave empty if not translated yet. The site shows “translation pending”."
            error={errors.name_ta}
          >
            <input id="name_ta" lang="ta" className="field" {...register("name_ta")} />
          </Field>
        </div>
        <Field
          label="Web address (slug) *"
          htmlFor="slug"
          hint="Lowercase letters, numbers and hyphens. Created from the English name."
          error={errors.slug}
        >
          <input
            id="slug"
            className="field"
            aria-invalid={!!errors.slug}
            {...register("slug", {
              onChange: () => {
                slugTouched.current = true;
              },
            })}
          />
        </Field>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-forest-900">Price and stock</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Price"
            htmlFor="price"
            hint={hasActiveVariant ? "Optional when package sizes are used." : "Price for one unit."}
            error={errors.price}
          >
            <input
              id="price"
              inputMode="decimal"
              className="field"
              aria-invalid={!!errors.price}
              {...register("price")}
            />
          </Field>
          <Field label="Pricing unit" htmlFor="pricing_unit" error={errors.pricing_unit}>
            <select id="pricing_unit" className="field" {...register("pricing_unit")}>
              <option value="kg">per kg</option>
              <option value="g">per g</option>
              <option value="litre">per litre</option>
              <option value="piece">per piece</option>
              <option value="pack">per pack</option>
            </select>
          </Field>
          <Field label="Stock status" htmlFor="stock_status" error={errors.stock_status}>
            <select id="stock_status" className="field" {...register("stock_status")}>
              <option value="in_stock">In stock</option>
              <option value="limited">Limited stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Minimum quantity" htmlFor="min_quantity" error={errors.min_quantity}>
            <input id="min_quantity" inputMode="decimal" className="field" {...register("min_quantity")} />
          </Field>
          <Field
            label="Quantity step"
            htmlFor="quantity_step"
            hint="e.g. 0.5 lets customers add 0.5 kg at a time."
            error={errors.quantity_step}
          >
            <input id="quantity_step" inputMode="decimal" className="field" {...register("quantity_step")} />
          </Field>
          <Field label="Maximum quantity" htmlFor="max_quantity" error={errors.max_quantity}>
            <input id="max_quantity" inputMode="decimal" className="field" {...register("max_quantity")} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-forest-900">Package sizes</h2>
            <p className="text-sm text-muted">Optional. Each size is sold as its own option with its own price.</p>
          </div>
          <button
            type="button"
            className="btn btn-outline !min-h-10"
            onClick={() =>
              variants.append({
                label_en: "",
                label_ta: "",
                price: "",
                stock_status: "in_stock",
                is_active: true,
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add size
          </button>
        </div>
        {variants.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 rounded-xl border border-line p-4 md:grid-cols-[1fr_1fr_8rem_9rem_auto]">
            <Field label="Label (English)" htmlFor={`v-en-${i}`} error={errors.variants?.[i]?.label_en}>
              <input id={`v-en-${i}`} className="field" {...register(`variants.${i}.label_en`)} />
            </Field>
            <Field label="Label (Tamil)" htmlFor={`v-ta-${i}`}>
              <input id={`v-ta-${i}`} lang="ta" className="field" {...register(`variants.${i}.label_ta`)} />
            </Field>
            <Field label="Price" htmlFor={`v-p-${i}`} error={errors.variants?.[i]?.price}>
              <input id={`v-p-${i}`} inputMode="decimal" className="field" {...register(`variants.${i}.price`)} />
            </Field>
            <Field label="Stock" htmlFor={`v-s-${i}`}>
              <select id={`v-s-${i}`} className="field" {...register(`variants.${i}.stock_status`)}>
                <option value="in_stock">In stock</option>
                <option value="limited">Limited</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </Field>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-5 w-5" {...register(`variants.${i}.is_active`)} />
                Active
              </label>
              <button
                type="button"
                aria-label={`Remove size ${i + 1}`}
                onClick={() => variants.remove(i)}
                className="rounded-full p-2 text-danger hover:bg-[#fbeae6]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-forest-900">Descriptions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Short description (English)" htmlFor="sd_en" error={errors.short_description_en}>
            <textarea id="sd_en" rows={2} className="field" {...register("short_description_en")} />
          </Field>
          <Field label="Short description (Tamil)" htmlFor="sd_ta" error={errors.short_description_ta}>
            <textarea id="sd_ta" lang="ta" rows={2} className="field" {...register("short_description_ta")} />
          </Field>
          <Field label="Full description (English)" htmlFor="d_en" error={errors.description_en}>
            <textarea id="d_en" rows={5} className="field" {...register("description_en")} />
          </Field>
          <Field label="Full description (Tamil)" htmlFor="d_ta" error={errors.description_ta}>
            <textarea id="d_ta" lang="ta" rows={5} className="field" {...register("description_ta")} />
          </Field>
          <Field label="Ingredients (English)" htmlFor="i_en" hint="Only add if confirmed.">
            <textarea id="i_en" rows={2} className="field" {...register("ingredients_en")} />
          </Field>
          <Field label="Ingredients (Tamil)" htmlFor="i_ta">
            <textarea id="i_ta" lang="ta" rows={2} className="field" {...register("ingredients_ta")} />
          </Field>
          <Field label="Storage (English)" htmlFor="s_en" hint="Only add if confirmed.">
            <textarea id="s_en" rows={2} className="field" {...register("storage_en")} />
          </Field>
          <Field label="Storage (Tamil)" htmlFor="s_ta">
            <textarea id="s_ta" lang="ta" rows={2} className="field" {...register("storage_ta")} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-forest-900">Images</h2>
          <p className="mt-1 text-sm text-muted">
            Upload product photos directly to Cloudinary, or enter an existing image URL or path.
          </p>
        </div>

        {uploadError && (
          <p role="alert" className="rounded-xl bg-[#f6dcd6] p-3 text-sm font-semibold text-danger">
            {uploadError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <label
            className={`btn btn-primary cursor-pointer !min-h-10 text-sm ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload product image</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              disabled={uploading}
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>

          <span className="text-sm font-medium text-muted">or</span>

          <div className="flex flex-1 items-center gap-2 min-w-[260px]">
            <input
              type="text"
              placeholder="Enter image URL or path (e.g. /logo.png)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="field text-sm"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="btn btn-outline !min-h-10 text-sm whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add URL
            </button>
          </div>
        </div>

        {images.fields.length === 0 && (
          <p className="text-muted">No images yet. The shop will show a placeholder.</p>
        )}

        <ul className="grid gap-4 sm:grid-cols-2">
          {images.fields.map((f, i) => {
            const src = imageUrl(watchedImages?.[i]?.path);
            return (
              <li key={f.id} className="flex gap-3 rounded-xl border border-line p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ivory">
                  {src && <Image src={src} alt="" fill sizes="96px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    aria-label={`Image ${i + 1} URL or path`}
                    placeholder="Image URL / path"
                    className="field !min-h-9 text-sm"
                    {...register(`images.${i}.path`)}
                  />
                  <input
                    aria-label={`Image ${i + 1} alt text (English)`}
                    placeholder="Alt text (English)"
                    className="field !min-h-9 text-sm"
                    {...register(`images.${i}.alt_en`)}
                  />
                  <input
                    aria-label={`Image ${i + 1} alt text (Tamil)`}
                    placeholder="Alt text (Tamil)"
                    lang="ta"
                    className="field !min-h-9 text-sm"
                    {...register(`images.${i}.alt_ta`)}
                  />
                  <div className="flex flex-wrap gap-1 text-sm">
                    <button
                      type="button"
                      aria-label="Move image earlier"
                      disabled={i === 0}
                      onClick={() => images.move(i, i - 1)}
                      className="rounded-full p-1.5 hover:bg-forest-50 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move image later"
                      disabled={i === images.fields.length - 1}
                      onClick={() => images.move(i, i + 1)}
                      className="rounded-full p-1.5 hover:bg-forest-50 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => images.remove(i)}
                      className="rounded-full px-3 py-1 font-semibold text-danger hover:bg-[#fbeae6]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-forest-900">Organisation</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Category" htmlFor="category_id">
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <select
                  id="category_id"
                  className="field"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                >
                  <option value="">{lang === "ta" ? "வகை இல்லை" : "No category"}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(lang, c.name_en, c.name_ta).text}
                    </option>
                  ))}
                </select>
              )}
            />
          </Field>
          <Field label={lang === "ta" ? "நிலை" : "Visibility"} htmlFor="status" hint={lang === "ta" ? "செயலில் உள்ள பொருட்கள் மட்டுமே தளத்தில் தோன்றும்." : "Only Active products show on the website."}>
            <select id="status" className="field" {...register("status")}>
              <option value="draft">{lang === "ta" ? "செயலற்றது (மறைக்கப்பட்டது)" : "Inactive (hidden)"}</option>
              <option value="active">{lang === "ta" ? "செயலில் (தெரியும்)" : "Active (visible)"}</option>
              <option value="archived">{lang === "ta" ? "காப்பகப்படுத்தப்பட்டது" : "Archived"}</option>
            </select>
          </Field>
          <Field
            label={lang === "ta" ? "காட்சி வரிசை" : "Display order"}
            htmlFor="sort_order"
            hint={lang === "ta" ? "குறைந்த எண்கள் முதலில் தோன்றும்." : "Lower numbers appear first."}
            error={errors.sort_order}
          >
            <input id="sort_order" inputMode="numeric" className="field" {...register("sort_order")} />
          </Field>
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5" {...register("is_featured")} />
          {lang === "ta" ? "முகப்பில் சிறப்புப் பொருளாகக் காட்டு" : "Show on the homepage as a featured product"}
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? pf.saving : pf.save}
        </button>
        <Link href="/admin/products" className="btn btn-outline">
          {lang === "ta" ? "ரத்து செய்" : "Cancel"}
        </Link>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {lang === "ta" ? "குறிக்கப்பட்ட பிழைகளைச் சரிசெய்யவும்." : "Please fix the highlighted fields."}
          </p>
        )}
      </div>
    </form>
  );
}
