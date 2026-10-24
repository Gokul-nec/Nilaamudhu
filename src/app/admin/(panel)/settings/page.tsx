import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePasswordCard } from "@/components/admin/ChangePasswordCard";
import type { SettingsFormInput } from "@/lib/validation";
import { DEFAULT_SETTINGS } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const { db } = await requireAdmin();
  const doc = await db.collection("settings").doc("site").get();
  const s = { ...DEFAULT_SETTINGS, ...(doc.exists ? doc.data() : {}) };
  const t = (v: string | null | undefined) => v ?? "";
  const initial: SettingsFormInput = {
    business_name_en: s.business_name_en,
    business_name_ta: s.business_name_ta,
    tagline_en: t(s.tagline_en),
    tagline_ta: t(s.tagline_ta),
    announcement_en: t(s.announcement_en),
    announcement_ta: t(s.announcement_ta),
    about_en: t(s.about_en),
    about_ta: t(s.about_ta),
    quality_en: t(s.quality_en),
    quality_ta: t(s.quality_ta),
    whatsapp_number: t(s.whatsapp_number),
    contact_phone: t(s.contact_phone),
    contact_email: t(s.contact_email),
    address_en: t(s.address_en),
    address_ta: t(s.address_ta),
    instagram_url: t(s.instagram_url),
    facebook_url: t(s.facebook_url),
    currency_symbol: s.currency_symbol,
    default_language: s.default_language,
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-semibold text-forest-900">Business settings</h1>
        <p className="mt-1 text-muted">
          These details appear across the website and in WhatsApp orders.
        </p>
      </div>

      <SettingsForm initial={initial} />

      <ChangePasswordCard />
    </div>
  );
}
