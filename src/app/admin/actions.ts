"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { categoryFormSchema, productFormSchema, settingsFormSchema } from "@/lib/validation";
import { SESSION_COOKIE } from "@/app/api/auth/session/route";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });
const firstIssue = (e: { issues: { path: PropertyKey[]; message: string }[] }) => {
  const i = e.issues[0];
  return `${i.path.map(String).join(".") || "form"}: ${i.message}`;
};
const refresh = () => revalidatePath("/", "layout");

/** Every action re-verifies the admin role on the server. The browser is never trusted. */
async function admin() {
  const a = await getAdmin();
  if (!a) throw new Error("forbidden");
  return a.db;
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function saveProductAction(input: unknown, id: string | null): Promise<ActionResult> {
  let db: Awaited<ReturnType<typeof admin>>;
  try {
    db = await admin();
  } catch {
    return fail("You are not authorised to do this.");
  }

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const v = parsed.data;

  // Check slug uniqueness
  const slugQuery = await db.collection("products").where("slug", "==", v.slug).get();
  const slugConflict = slugQuery.docs.find((d) => d.id !== id);
  if (slugConflict) {
    return fail("That slug is already used by another product.");
  }

  const variants = v.variants.map((variant, index) => ({
    id: variant.id || crypto.randomUUID(),
    label_en: variant.label_en,
    label_ta: variant.label_ta || null,
    price: Number(variant.price),
    stock_status: variant.stock_status,
    is_active: variant.is_active,
    sort_order: index,
  }));

  const images = v.images.map((img, index) => ({
    id: img.id || crypto.randomUUID(),
    path: img.path,
    alt_en: img.alt_en || null,
    alt_ta: img.alt_ta || null,
    sort_order: index,
  }));

  const productData = {
    slug: v.slug,
    category_id: v.category_id || null,
    name_en: v.name_en,
    name_ta: v.name_ta || null,
    short_description_en: v.short_description_en || null,
    short_description_ta: v.short_description_ta || null,
    description_en: v.description_en || null,
    description_ta: v.description_ta || null,
    ingredients_en: v.ingredients_en || null,
    ingredients_ta: v.ingredients_ta || null,
    storage_en: v.storage_en || null,
    storage_ta: v.storage_ta || null,
    price: v.price === "" ? null : Number(v.price),
    pricing_unit: v.pricing_unit,
    min_quantity: Number(v.min_quantity),
    quantity_step: Number(v.quantity_step),
    max_quantity: Number(v.max_quantity),
    stock_status: v.stock_status,
    status: v.status,
    is_featured: v.is_featured,
    sort_order: Number(v.sort_order),
    variants,
    images,
    updated_at: new Date().toISOString(),
  };

  let productId = id;
  if (id) {
    await db.collection("products").doc(id).set(productData, { merge: true });
  } else {
    const docRef = await db.collection("products").add({
      ...productData,
      created_at: new Date().toISOString(),
    });
    productId = docRef.id;
  }

  refresh();
  return { ok: true, id: productId ?? undefined };
}

export async function setProductStatusAction(
  id: string,
  status: "draft" | "active" | "archived"
): Promise<ActionResult> {
  let db: Awaited<ReturnType<typeof admin>>;
  try {
    db = await admin();
  } catch {
    return fail("You are not authorised to do this.");
  }

  if (!["draft", "active", "archived"].includes(status)) return fail("Invalid status");
  await db.collection("products").doc(id).update({
    status,
    updated_at: new Date().toISOString(),
  });

  refresh();
  return { ok: true };
}

export async function saveCategoryAction(input: unknown, id: string | null): Promise<ActionResult> {
  let db: Awaited<ReturnType<typeof admin>>;
  try {
    db = await admin();
  } catch {
    return fail("You are not authorised to do this.");
  }

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const v = parsed.data;

  // Check slug uniqueness
  const slugQuery = await db.collection("categories").where("slug", "==", v.slug).get();
  const slugConflict = slugQuery.docs.find((d) => d.id !== id);
  if (slugConflict) {
    return fail("That slug is already used by another category.");
  }

  const categoryData = {
    slug: v.slug,
    name_en: v.name_en,
    name_ta: v.name_ta || null,
    sort_order: Number(v.sort_order),
    is_active: v.is_active,
    image_path: v.image_path || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    await db.collection("categories").doc(id).set(categoryData, { merge: true });
  } else {
    await db.collection("categories").add({
      ...categoryData,
      created_at: new Date().toISOString(),
    });
  }

  refresh();
  return { ok: true };
}

/** Products in a deleted category are kept and become uncategorised (ON DELETE SET NULL). */
export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  let db: Awaited<ReturnType<typeof admin>>;
  try {
    db = await admin();
  } catch {
    return fail("You are not authorised to do this.");
  }

  await db.collection("categories").doc(id).delete();

  // Reset category_id for affected products
  const affected = await db.collection("products").where("category_id", "==", id).get();
  if (!affected.empty) {
    const batch = db.batch();
    affected.docs.forEach((doc) => {
      batch.update(doc.ref, { category_id: null, updated_at: new Date().toISOString() });
    });
    await batch.commit();
  }

  refresh();
  return { ok: true };
}

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  let db: Awaited<ReturnType<typeof admin>>;
  try {
    db = await admin();
  } catch {
    return fail("You are not authorised to do this.");
  }

  const parsed = settingsFormSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  await db.collection("settings").doc("site").set(parsed.data, { merge: true });
  refresh();
  return { ok: true };
}

export type UploadResult =
  | { ok: true; url: string; public_id: string }
  | { ok: false; error: string };

const failUpload = (error: string): UploadResult => ({ ok: false, error });

export async function uploadImageAction(
  formData: FormData,
  folder: "products" | "categories" = "products"
): Promise<UploadResult> {
  try {
    await admin();
  } catch {
    return failUpload("You are not authorised to do this.");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return failUpload("No image file provided.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return failUpload("Invalid file type. Please upload a JPEG, PNG, WebP, AVIF, or GIF image.");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return failUpload("File is too large. Maximum size allowed is 5MB.");
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const targetFolder = `nilaamudhu/${folder}`;
    const { uploadToCloudinary } = await import("@/lib/cloudinary");
    const result = await uploadToCloudinary(buffer, targetFolder);
    return { ok: true, url: result.url, public_id: result.public_id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image upload failed.";
    return failUpload(message);
  }
}

export async function changeAdminPasswordAction(newPassword: string): Promise<ActionResult> {
  let adminSession: Awaited<ReturnType<typeof getAdmin>>;
  try {
    adminSession = await getAdmin();
    if (!adminSession) return fail("You are not authorised to do this.");
  } catch {
    return fail("You are not authorised to do this.");
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return fail("Password must be at least 6 characters long.");
  }

  try {
    const { getAdminAuth } = await import("@/lib/firebase/admin");
    const auth = getAdminAuth();
    if (!auth) {
      return fail("Firebase Authentication admin service is not initialized.");
    }

    await auth.updateUser(adminSession.user.id, {
      password: newPassword.trim(),
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to change password.";
    return fail(message);
  }
}

