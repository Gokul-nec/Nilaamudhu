import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import type { Lang, SiteSettings } from "@/lib/types";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";

export function Footer({ settings, lang }: { settings: SiteSettings; lang: Lang }) {
  const t = dictionaries[lang];
  const name = pick(lang, settings.business_name_en, settings.business_name_ta).text;
  const address = pick(lang, settings.address_en, settings.address_ta).text;
  const tagline = pick(lang, settings.tagline_en, settings.tagline_ta).text;

  return (
    <footer className="mt-16 sm:mt-20 border-t border-[var(--color-line)] bg-[var(--color-forest-950)] text-white/85">
      {/* Main footer content */}
      <div className="container-page grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1.2fr]">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-4">
            <Image
              src="/footer-logo.png"
              alt={name}
              width={96}
              height={96}
              priority
              className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full object-cover shadow-lg border-2 border-[var(--color-gold-500)]/50 transition-transform duration-300 hover:scale-105"
            />
            <div>
              <p className="font-display text-2xl font-semibold text-white tracking-tight">{name}</p>
              {tagline && <p className="mt-1 max-w-xs text-sm text-white/70 leading-relaxed">{tagline}</p>}
            </div>
          </div>

          {/* WhatsApp Direct Action */}
          {settings.whatsapp_number && (
            <div className="mt-5">
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>
            </div>
          )}
        </div>

        {/* Quick links */}
        <nav aria-label={t.footer.quickLinks}>
          <p className="font-display text-base font-semibold text-[var(--color-gold-300)] uppercase tracking-wider">
            {t.footer.quickLinks}
          </p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/" className="text-white/70 hover:text-white hover:underline underline-offset-4 transition-colors">
                {t.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-white/70 hover:text-white hover:underline underline-offset-4 transition-colors">
                {t.nav.shop}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <p className="font-display text-base font-semibold text-[var(--color-gold-300)] uppercase tracking-wider">
            {t.footer.contact}
          </p>
          <ul className="mt-4 space-y-3">
            {settings.contact_phone && (
              <li className="flex items-center gap-2.5 text-white/70">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-gold-500)]" aria-hidden />
                <a
                  href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}
                  className="hover:text-white hover:underline underline-offset-4 transition-colors"
                >
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings.contact_email && (
              <li className="flex items-center gap-2.5 text-white/70">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-gold-500)]" aria-hidden />
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="break-all hover:text-white hover:underline underline-offset-4 transition-colors"
                >
                  {settings.contact_email}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--color-gold-500)]" aria-hidden />
                <span className="whitespace-pre-line leading-relaxed">{address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-sm text-white/50">
          <p>
            <Link href="/admin/login" className="hover:text-white/80 transition-colors" tabIndex={-1}>
              ©
            </Link>{" "}
            {new Date().getFullYear()} {name}. {t.footer.rights}
          </p>
          <p>{t.footer.developedBy} <span className="font-semibold text-white/80">GODAX</span></p>
        </div>
      </div>
    </footer>
  );
}
