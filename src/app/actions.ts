"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANG_COOKIE, isLang } from "@/lib/i18n/lang";
import type { Lang } from "@/lib/types";

export async function setLanguageCookieAction(lang: Lang): Promise<{ ok: boolean }> {
  if (!isLang(lang)) return { ok: false };
  const cookieStore = await cookies();
  cookieStore.set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
