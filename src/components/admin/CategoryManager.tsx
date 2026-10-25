"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { categoryFormSchema, type CategoryFormInput, type CategoryFormOutput } from "@/lib/validation";
import { deleteCategoryAction, saveCategoryAction, uploadImageAction } from "@/app/admin/actions";
import { imageUrl, slugify } from "@/lib/product-utils";
import { useLang } from "@/components/Providers";

export interface CategoryRow {
  id: string;
  slug: string;
  name_en: string;
  name_ta: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
}

const blank: CategoryFormInput = {
  name_en: "",
  name_ta: "",
  slug: "",
  sort_order: "0",
  is_active: true,
  image_path: null,
};

function CategoryEditor({ row, onDone }: { row: CategoryRow | null; onDone: () => void }) {
  const router = useRouter();
  const { t } = useLang();
  const catT = t.admin.categories;
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(Boolean(row));
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormOutput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: row
      ? {
          name_en: row.name_en,
          name_ta: row.name_ta ?? "",
          slug: row.slug,
          sort_order: String(row.sort_order),
          is_active: row.is_active,
          image_path: row.image_path,
        }
      : blank,
  });
  const imagePath = watch("image_path");
  const src = imageUrl(imagePath);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageAction(formData, "categories");
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!res.ok) {
      setUploadError(res.error);
      return;
    }

    setValue("image_path", res.url, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async () => {
    setError(null);
    const res = await saveCategoryAction(getValues(), row?.id ?? null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!row) reset(blank);
    router.refresh();
    onDone();
  };

  const id = row?.id ?? "new";
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-3 md:grid-cols-2">
      <div>
        <label htmlFor={`c-en-${id}`} className="mb-1 block font-semibold">
          {catT.nameEn}
        </label>
        <input
          id={`c-en-${id}`}
          className="field"
          aria-invalid={!!errors.name_en}
          {...register("name_en", {
            onChange: (e) => {
              if (!slugTouched.current) setValue("slug", slugify(e.target.value));
            },
          })}
        />
        {errors.name_en && <p role="alert" className="mt-1 text-sm text-danger">{errors.name_en.message}</p>}
      </div>
      <div>
        <label htmlFor={`c-ta-${id}`} className="mb-1 block font-semibold">
          {catT.nameTa}
        </label>
        <input id={`c-ta-${id}`} lang="ta" className="field" {...register("name_ta")} />
      </div>
      <div>
        <label htmlFor={`c-slug-${id}`} className="mb-1 block font-semibold">
          {catT.slug}
        </label>
        <input
          id={`c-slug-${id}`}
          className="field"
          aria-invalid={!!errors.slug}
          {...register("slug", {
            onChange: () => {
              slugTouched.current = true;
            },
          })}
        />
        {errors.slug && <p role="alert" className="mt-1 text-sm text-danger">{errors.slug.message}</p>}
      </div>
      <div>
        <label htmlFor={`c-ord-${id}`} className="mb-1 block font-semibold">
          {catT.order}
        </label>
        <input id={`c-ord-${id}`} inputMode="numeric" className="field" {...register("sort_order")} />
        {errors.sort_order && <p role="alert" className="mt-1 text-sm text-danger">{errors.sort_order.message}</p>}
      </div>
      <div className="md:col-span-2">
        <label htmlFor={`c-img-${id}`} className="mb-1 block font-semibold">
          {catT.image}
        </label>
        {uploadError && (
          <p role="alert" className="mb-2 text-sm font-semibold text-danger">
            {uploadError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory">
            {src && <Image src={src} alt="" fill sizes="48px" className="object-cover" />}
          </div>
          <label
            className={`btn btn-outline !min-h-9 cursor-pointer text-sm ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{catT.uploading}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>{catT.upload}</span>
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
          <input
            id={`c-img-${id}`}
            placeholder={catT.imagePlaceholder}
            className="field flex-1 !min-h-9 text-sm min-w-[200px]"
            {...register("image_path")}
          />
          {imagePath && (
            <button
              type="button"
              className="text-sm font-semibold text-danger"
              onClick={() => setValue("image_path", null, { shouldDirty: true })}
            >
              {catT.clear}
            </button>
          )}
        </div>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" className="h-5 w-5" {...register("is_active")} />
        {catT.activeCheckbox}
      </label>
      {error && <p role="alert" className="text-sm font-semibold text-danger md:col-span-2">{error}</p>}
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary !min-h-10">
          {row ? catT.saveCategory : catT.addCategory}
        </button>
        {row && (
          <button type="button" className="btn btn-outline !min-h-10" onClick={onDone}>
            {catT.cancel}
          </button>
        )}
      </div>
    </form>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { t } = useLang();
  const catT = t.admin.categories;
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(c: CategoryRow) {
    if (!window.confirm(catT.confirmDelete)) return;
    const res = await deleteCategoryAction(c.id);
    if (!res.ok) setError(res.error);
    else {
      setError(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="mb-4 text-2xl font-semibold text-forest-900">{catT.addCategory}</h2>
        <CategoryEditor row={null} onDone={() => undefined} />
      </section>
      {error && <p role="alert" className="font-semibold text-danger">{error}</p>}
      {categories.length === 0 ? (
        <p className="card p-8 text-center text-muted">{catT.noCategories}</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => (
            <li key={c.id} className="card p-5">
              {editing === c.id ? (
                <CategoryEditor row={c} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-forest-900">
                      {c.name_en}
                      {c.name_ta && <span lang="ta" className="ml-2 font-normal text-muted">{c.name_ta}</span>}
                    </p>
                    <p className="text-sm text-muted">
                      /{c.slug} · {catT.orderLabel} {c.sort_order} · {c.is_active ? catT.activeLabel : catT.inactiveLabel}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-outline !min-h-9 text-sm" onClick={() => setEditing(c.id)}>
                      {catT.edit}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline !min-h-9 text-sm !text-danger"
                      onClick={() => remove(c)}
                    >
                      {catT.delete}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
