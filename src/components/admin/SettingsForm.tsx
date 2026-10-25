"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsFormSchema, type SettingsFormInput, type SettingsFormOutput } from "@/lib/validation";
import { saveSettingsAction } from "@/app/admin/actions";
import { useLang } from "@/components/Providers";

type Name = keyof SettingsFormInput;

export function SettingsForm({ initial }: { initial: SettingsFormInput }) {
  const router = useRouter();
  const { t } = useLang();
  const st = t.admin.settings;
  const flds = st.fields;

  const fields: { name: Name; label: string; hint?: string; lang?: "ta"; area?: boolean; inputMode?: "numeric" | "tel" }[] = useMemo(() => [
    { name: "business_name_en", label: flds.business_name_en },
    { name: "business_name_ta", label: flds.business_name_ta, lang: "ta" },
    { name: "whatsapp_number", label: flds.whatsapp_number, hint: flds.whatsappHint, inputMode: "numeric" },
    { name: "contact_phone", label: flds.contact_phone, inputMode: "tel" },
    { name: "contact_email", label: flds.contact_email },
    { name: "currency_symbol", label: flds.currency_symbol, hint: flds.currencyHint },
    { name: "tagline_en", label: flds.tagline_en },
    { name: "tagline_ta", label: flds.tagline_ta, lang: "ta" },
    { name: "announcement_en", label: flds.announcement_en, hint: flds.announcementHint },
    { name: "announcement_ta", label: flds.announcement_ta, lang: "ta" },
    { name: "address_en", label: flds.address_en, area: true },
    { name: "address_ta", label: flds.address_ta, area: true, lang: "ta" },
    { name: "about_en", label: flds.about_en, area: true, hint: flds.aboutHint },
    { name: "about_ta", label: flds.about_ta, area: true, lang: "ta" },
    { name: "quality_en", label: flds.quality_en, area: true, hint: flds.qualityHint },
    { name: "quality_ta", label: flds.quality_ta, area: true, lang: "ta" },
    { name: "instagram_url", label: flds.instagram_url },
    { name: "facebook_url", label: flds.facebook_url },
  ], [flds]);

  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<SettingsFormInput, unknown, SettingsFormOutput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: initial,
  });

  const onSubmit = async () => {
    setMessage(null);
    const res = await saveSettingsAction(getValues());
    if (!res.ok) {
      setMessage({ ok: false, text: res.error });
      return;
    }
    setMessage({ ok: true, text: st.saved });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.area ? "md:col-span-1" : ""}>
            <label htmlFor={f.name} className="mb-1 block font-semibold">{f.label}</label>
            {f.area ? (
              <textarea id={f.name} rows={3} lang={f.lang} className="field" aria-invalid={!!errors[f.name]} {...register(f.name)} />
            ) : (
              <input id={f.name} lang={f.lang} inputMode={f.inputMode} className="field" aria-invalid={!!errors[f.name]} {...register(f.name)} />
            )}
            {f.hint && !errors[f.name] && <p className="mt-1 text-sm text-muted">{f.hint}</p>}
            {errors[f.name] && <p role="alert" className="mt-1 text-sm text-danger">{errors[f.name]?.message as string}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="default_language" className="mb-1 block font-semibold">{st.defaultLang}</label>
          <select id="default_language" className="field" {...register("default_language")}>
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
          <p className="mt-1 text-sm text-muted">{st.defaultLangHint}</p>
        </div>
      </div>
      {message && (
        <p role={message.ok ? "status" : "alert"} className={`font-semibold ${message.ok ? "text-forest-800" : "text-danger"}`}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        {isSubmitting ? st.saving : st.save}
      </button>
    </form>
  );
}
