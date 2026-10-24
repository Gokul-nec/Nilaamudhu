import type { Lang } from "../types";

export const LANG_COOKIE = "nm_lang";
export const isLang = (v: unknown): v is Lang => v === "en" || v === "ta";

/** Picks the Tamil or English copy. Falls back to English and reports when Tamil is pending. */
export function pick(lang: Lang, en: string | null | undefined, ta: string | null | undefined): { text: string; pending: boolean } {
  const english = en ?? "";
  if (lang === "ta") {
    if (ta && ta.trim()) return { text: ta, pending: false };
    return { text: english, pending: english.length > 0 };
  }
  return { text: english, pending: false };
}
