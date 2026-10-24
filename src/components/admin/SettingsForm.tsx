"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsFormSchema, type SettingsFormInput, type SettingsFormOutput } from "@/lib/validation";
import { saveSettingsAction } from "@/app/admin/actions";

type Name = keyof SettingsFormInput;
const FIELDS: { name: Name; label: string; hint?: string; lang?: "ta"; area?: boolean; inputMode?: "numeric" | "tel" }[] = [
  { name: "business_name_en", label: "Business name (English) *" }, { name: "business_name_ta", label: "Business name (Tamil) *", lang: "ta" },
  { name: "whatsapp_number", label: "WhatsApp number", hint: "Digits only, with country code and no + sign. Example: 919876543210", inputMode: "numeric" },
  { name: "contact_phone", label: "Contact phone", inputMode: "tel" }, { name: "contact_email", label: "Contact email" },
  { name: "currency_symbol", label: "Currency symbol *", hint: "Shown before prices, e.g. ₹" },
  { name: "tagline_en", label: "Homepage headline (English)" }, { name: "tagline_ta", label: "Homepage headline (Tamil)", lang: "ta" },
  { name: "announcement_en", label: "Announcement bar (English)", hint: "Leave empty to hide the bar." }, { name: "announcement_ta", label: "Announcement bar (Tamil)", lang: "ta" },
  { name: "address_en", label: "Address (English)", area: true }, { name: "address_ta", label: "Address (Tamil)", area: true, lang: "ta" },
  { name: "about_en", label: "About us (English)", area: true, hint: "Only shown on the homepage when filled in." }, { name: "about_ta", label: "About us (Tamil)", area: true, lang: "ta" },
  { name: "quality_en", label: "Product quality information (English)", area: true, hint: "Only add details you can verify." }, { name: "quality_ta", label: "Product quality information (Tamil)", area: true, lang: "ta" },
  { name: "instagram_url", label: "Instagram link" }, { name: "facebook_url", label: "Facebook link" },
];

export function SettingsForm({ initial }: { initial: SettingsFormInput }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<SettingsFormInput, unknown, SettingsFormOutput>({ resolver: zodResolver(settingsFormSchema), defaultValues: initial });

  const onSubmit = async () => {
    setMessage(null);
    const res = await saveSettingsAction(getValues());
    if (!res.ok) { setMessage({ ok: false, text: res.error }); return; }
    setMessage({ ok: true, text: "Settings saved." });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.area ? "md:col-span-1" : ""}>
            <label htmlFor={f.name} className="mb-1 block font-semibold">{f.label}</label>
            {f.area ? <textarea id={f.name} rows={3} lang={f.lang} className="field" aria-invalid={!!errors[f.name]} {...register(f.name)} />
              : <input id={f.name} lang={f.lang} inputMode={f.inputMode} className="field" aria-invalid={!!errors[f.name]} {...register(f.name)} />}
            {f.hint && !errors[f.name] && <p className="mt-1 text-sm text-muted">{f.hint}</p>}
            {errors[f.name] && <p role="alert" className="mt-1 text-sm text-danger">{errors[f.name]?.message as string}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="default_language" className="mb-1 block font-semibold">Default language</label>
          <select id="default_language" className="field" {...register("default_language")}><option value="en">English</option><option value="ta">தமிழ் (Tamil)</option></select>
          <p className="mt-1 text-sm text-muted">Used for first-time visitors. Returning visitors keep their own choice.</p>
        </div>
      </div>
      {message && <p role={message.ok ? "status" : "alert"} className={`font-semibold ${message.ok ? "text-forest-800" : "text-danger"}`}>{message.text}</p>}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
