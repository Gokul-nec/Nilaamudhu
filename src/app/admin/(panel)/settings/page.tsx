import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePasswordCard } from "@/components/admin/ChangePasswordCard";
import type { SettingsFormInput } from "@/lib/validation";
import { DEFAULT_SETTINGS, getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const [{ db }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const t = dictionaries[lang].admin.settings;

  const doc = await db.collection("settings").doc("site").get();
  const s = { ...DEFAULT_SETTINGS, ...(doc.exists ? doc.data() : {}) };
  const val = (v: string | null | undefined) => v ?? "";
  const initial: SettingsFormInput = {
    business_name_en: s.business_name_en,
    business_name_ta: s.business_name_ta,
    tagline_en: val(s.tagline_en),
    tagline_ta: val(s.tagline_ta),
    announcement_en: val(s.announcement_en),
    announcement_ta: val(s.announcement_ta),
    about_en: val(s.about_en),
    about_ta: val(s.about_ta),
    quality_en: val(s.quality_en),
    quality_ta: val(s.quality_ta),
    whatsapp_number: val(s.whatsapp_number),
    contact_phone: val(s.contact_phone),
    contact_email: val(s.contact_email),
    address_en: val(s.address_en),
    address_ta: val(s.address_ta),
    instagram_url: val(s.instagram_url),
    facebook_url: val(s.facebook_url),
    currency_symbol: s.currency_symbol,
    default_language: s.default_language,
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-semibold text-forest-900">{t.title}</h1>
        <p className="mt-1 text-muted">{t.subtitle}</p>
      </div>

      <SettingsForm initial={initial} />

      <ChangePasswordCard />
    </div>
  );
}
