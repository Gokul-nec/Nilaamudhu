import Link from "next/link";
import { ArrowRight, Leaf, MessageCircle, Wheat, Zap } from "lucide-react";
import { getCategories, getFeaturedProducts, getLang, getProducts, getSettings } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { HeroArt } from "@/components/HeroArt";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroContent } from "@/components/HeroContent";
import { CategoryCardList } from "@/components/CategoryCardList";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { SectionHeading } from "@/components/ui";

export default async function HomePage() {
  const [lang, settings, categories, featuredRaw] = await Promise.all([
    getLang(),
    getSettings(),
    getCategories(),
    getFeaturedProducts(8),
  ]);
  const rawFeatured =
    featuredRaw.length > 0 ? featuredRaw : (await getProducts({ page: 1 })).products.slice(0, 8);
  // Prioritize products with live Cloudinary photography for carousel showcase
  const featured = [...rawFeatured].sort((a, b) => {
    const hasA = (a.product_images && a.product_images.length > 0) ? 1 : 0;
    const hasB = (b.product_images && b.product_images.length > 0) ? 1 : 0;
    return hasB - hasA || a.sort_order - b.sort_order;
  });
  const t = dictionaries[lang];
  const headline = pick(lang, settings.tagline_en, settings.tagline_ta).text;
  const about = pick(lang, settings.about_en, settings.about_ta).text;
  const quality = pick(lang, settings.quality_en, settings.quality_ta).text;
  const businessName = pick(lang, settings.business_name_en, settings.business_name_ta).text;
  const chatUrl = buildWhatsAppUrl(settings.whatsapp_number, lang === "ta" ? `வணக்கம் ${businessName}!` : `Hello ${businessName}!`);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[var(--color-cream)]" aria-labelledby="hero-heading">
        {/* Agriculture-themed background layer */}
        <HeroBackground />

        {/* Paper texture overlay (lightweight single-octave grain with hardware containment) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
          style={{
            contain: "strict",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container-page relative z-10 grid items-center gap-10 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-24 lg:py-28">
          {/* Left: copy with entrance animations and stat count-up */}
          <HeroContent
            lang={lang}
            headline={headline}
            heroLead={t.home.heroLead}
            shopNowText={t.home.shopNow}
            browseCategoriesText={t.home.browseCategories}
            stats={[
              { num: "100%", label: lang === "ta" ? "பாரம்பரியம்" : "Traditional Heritage" },
              { num: "100%", label: lang === "ta" ? "இயற்கையானது" : "Pure & Natural" },
              { num: "0%", label: lang === "ta" ? "இரசாயனமற்றது" : "Chemical Free" },
            ]}
            directFromFarmsText={lang === "ta" ? "தரமான தானியங்கள்" : "Direct From Farms"}
          />

          {/* Right: hero art (already animated logo seal - preserved without redesign) */}
          <HeroArt className="mx-auto w-full max-w-sm md:max-w-none" />
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="container-page scroll-mt-24 py-16">
        <div className="text-center">
          <p className="section-label">{lang === "ta" ? "அன்றாட ஆரோக்கியம்" : "Everyday Wellness"}</p>
          <SectionHeading title={t.home.categoriesTitle} />
        </div>
        {categories.length === 0 ? (
          <p className="card p-8 text-center text-[var(--color-muted)]">{t.home.noCategories}</p>
        ) : (
          <CategoryCardList categories={categories} lang={lang} />
        )}
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="bg-[var(--color-ivory)] py-16">
          <div className="container-page">
            <p className="section-label">{lang === "ta" ? "சிறப்பு தேர்வு" : "Handpicked for You"}</p>
            <SectionHeading
              title={t.home.featuredTitle}
              action={<Link href="/products" className="flex items-center gap-1 font-semibold text-[var(--color-forest-800)] underline underline-offset-4 hover:text-[var(--color-forest-900)]">{t.home.viewAll} <ArrowRight className="h-4 w-4" aria-hidden /></Link>}
            />

            {/* 1. Prominent Automatic Circular Sliding Carousel (5s reading interval, pause on hover/focus) */}
            <ProductCarousel products={featured} lang={lang} currency={settings.currency_symbol} intervalMs={5000} />

            {/* 2. Moved Downwards: Full Grid of Featured Products */}
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                {featured.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    currency={settings.currency_symbol}
                    priority={i < 4}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="container-page py-16">
        <div className="text-center">
          <p className="section-label">{lang === "ta" ? "எளிய செயல்முறை" : "Simple Process"}</p>
          <SectionHeading title={t.home.howTitle} />
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.steps.map((s, i) => (
            <li key={i} className="card relative overflow-hidden flex flex-col gap-3 p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              {/* Step number watermark */}
              <span className="pointer-events-none absolute -top-3 -right-2 font-display text-8xl font-bold text-[var(--color-forest-900)] opacity-[0.04] select-none" aria-hidden>
                {i + 1}
              </span>
              <span className="font-display grid h-10 w-10 place-items-center rounded-full bg-[var(--color-forest-900)] text-lg font-semibold text-[var(--color-gold-300)]" aria-hidden>{i + 1}</span>
              <h3 className="text-xl font-semibold text-[var(--color-ink)]">{s.title}</h3>
              <p className="text-[var(--color-muted)]">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Why Choose Us & Direct WhatsApp Care (Combined light-card layout) ── */}
      <section className="container-page py-16">
        <div className="text-center">
          <p className="section-label">{lang === "ta" ? "நமது சிறப்பு" : "Why Choose Nilaamudhu"}</p>
          <SectionHeading title={lang === "ta" ? "பாரம்பரிய தரம் & நேரடி உதவி" : "Pure Traditional Quality & Direct Care"} />
        </div>

        {/* 3 Trust Pillar Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: <Leaf className="h-6 w-6 text-[var(--color-forest-800)]" />,
              badgeBg: "bg-[var(--color-forest-50)] border border-[var(--color-forest-100)]",
              title: lang === "ta" ? "100% இயற்கை" : "100% Natural",
              text: lang === "ta" ? "எந்த செயற்கை பொருட்களும் இல்லை" : "No artificial ingredients whatsoever",
            },
            {
              icon: <Wheat className="h-6 w-6 text-[var(--color-gold-700)]" />,
              badgeBg: "bg-[#fef8ec] border border-[#f5e4bd]",
              title: lang === "ta" ? "சிறுதானிய செல்வம்" : "Millet Rich",
              text: lang === "ta" ? "பாரம்பரிய தானியங்களின் சத்து" : "Goodness of traditional ancient grains",
            },
            {
              icon: <Zap className="h-6 w-6 text-[var(--color-forest-800)]" />,
              badgeBg: "bg-[var(--color-forest-50)] border border-[var(--color-forest-100)]",
              title: lang === "ta" ? "புதிய சேகரிப்பு" : "Fresh Harvest",
              text: lang === "ta" ? "சீசனுக்கேற்ப கிடைக்கும் பொருட்கள்" : "Seasonal varieties from trusted farms",
            },
          ].map((u, i) => (
            <div
              key={i}
              className="card flex flex-col gap-3.5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${u.badgeBg}`}>
                {u.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-ink)]">{u.title}</h3>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{u.text}</p>
            </div>
          ))}
        </div>

        {/* Combined WhatsApp Direct Action Card */}
        {chatUrl && (
          <div className="mt-8 rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-8 shadow-sm flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center transition-all hover:shadow-md">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-forest-50)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-forest-800)] mb-2">
                <span>{lang === "ta" ? "நேரடி உதவி" : "Personal Assistance"}</span>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-ink)]">{t.home.contactTitle}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">{t.home.contactText}</p>
            </div>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp shrink-0 !px-7 animate-whatsapp-pulse transition-transform duration-300 hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              {t.home.chatNow}
            </a>
          </div>
        )}
      </section>

      {/* ── About / Quality ── */}
      {(about || quality) && (
        <section className="bg-[var(--color-ivory)] py-16">
          <div className="container-page grid gap-10 md:grid-cols-2">
            {about && (
              <div>
                <p className="section-label">{lang === "ta" ? "எங்களைப் பற்றி" : "Our Story"}</p>
                <h2 className="text-3xl font-semibold text-[var(--color-ink)]">{t.home.aboutTitle}</h2>
                <p className="mt-4 max-w-prose whitespace-pre-line text-[var(--color-muted)] leading-relaxed">{about}</p>
              </div>
            )}
            {quality && (
              <div>
                <p className="section-label">{lang === "ta" ? "எங்கள் தரம்" : "Our Promise"}</p>
                <h2 className="text-3xl font-semibold text-[var(--color-ink)]">{t.home.qualityTitle}</h2>
                <p className="mt-4 max-w-prose whitespace-pre-line text-[var(--color-muted)] leading-relaxed">{quality}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
