"use client";

import { useLang } from "./Providers";
import { pick } from "@/lib/i18n/lang";

export function AnnouncementBar({
  announcementEn,
  announcementTa,
}: {
  announcementEn: string | null | undefined;
  announcementTa: string | null | undefined;
}) {
  const { lang } = useLang();
  const text = pick(lang, announcementEn, announcementTa).text;
  if (!text) return null;
  return (
    <div className="bg-[var(--color-forest-950)] px-4 py-2 text-center text-xs sm:text-sm font-medium tracking-wide text-white/90 border-b border-white/10">
      {text}
    </div>
  );
}
