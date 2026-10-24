import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, HeartHandshake, Leaf, ShieldCheck, Truck } from "lucide-react";
import { getLang, getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { pick } from "@/lib/i18n/lang";
import { activeVariants, displayPrice, effectiveStock, imageUrl, sortedImages } from "@/lib/product-utils";
import { Gallery } from "@/components/Gallery";
import { PurchasePanel } from "@/components/PurchasePanel";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs, SectionHeading } from "@/components/ui";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [product, lang] = await Promise.all([getProductBySlug(slug), getLang()]);
  if (!product) return { title: dictionaries[lang].product.notFound, robots: { index: false } };
  const name = pick(lang, product.name_en, product.name_ta).text;
  const desc = pick(lang, product.short_description_en ?? product.description_en, product.short_description_ta ?? product.description_ta).text.slice(0, 160);
  const img = imageUrl(sortedImages(product)[0]?.path);
  return {
    title: name,
    description: desc || undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { type: "website", title: name, description: desc || undefined, images: img ? [{ url: img }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, lang, settings] = await Promise.all([getProductBySlug(slug), getLang(), getSettings()]);
  if (!product) notFound();
  const t = dictionaries[lang];
  const related = await getRelatedProducts(product);
  const name = pick(lang, product.name_en, product.name_ta);
  const description = pick(lang, product.description_en, product.description_ta).text;
  const ingredients = pick(lang, product.ingredients_en, product.ingredients_ta).text;
  const storage = pick(lang, product.storage_en, product.storage_ta).text;
  const images = sortedImages(product).flatMap((i) => {
    const src = imageUrl(i.path);
    return src ? [{ src, alt: (lang === "ta" ? i.alt_ta : i.alt_en) || i.alt_en || name.text }] : [];
  });
  const variants = activeVariants(product);
  const price = displayPrice(product);
  const category = product.categories;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_en,
    ...(images[0] ? { image: images.map((i) => i.src) } : {}),
    ...(product.description_en ? { description: product.description_en } : {}),
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: (price.paise / 100).toFixed(2),
            availability: effectiveStock(product) === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[
          { label: t.product.breadcrumbHome, href: "/" },
          { label: t.shop.title, href: "/products" },
          ...(category ? [{ label: pick(lang, category.name_en, category.name_ta).text, href: `/products?category=${category.slug}` }] : []),
          { label: name.text },
        ]}
      />

      {/* Top Hero: Product Image & Buy Box perfectly balanced */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Left: Gallery - hugs the image with self-start, eliminating empty white space */}
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-sm sm:p-5 self-start">
          <Gallery images={images} name={name.text} />
        </div>

        {/* Right: Info + Purchase */}
        <div className="flex flex-col">
          {category && (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold-700)]">
              {pick(lang, category.name_en, category.name_ta).text}
            </span>
          )}
          <h1 className="mt-1 text-3xl leading-tight font-semibold text-[var(--color-ink)] sm:text-4xl">
            {name.text}
          </h1>
          {name.pending && <p className="mt-1 text-sm text-[var(--color-gold-700)]">{t.common.tamilPending}</p>}
          {lang === "ta" && product.name_en && !name.pending && <p className="mt-1 text-sm text-[var(--color-muted)]">{product.name_en}</p>}
          {lang === "en" && product.name_ta && <p className="mt-1 text-sm text-[var(--color-muted)]" lang="ta">{product.name_ta}</p>}

          <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
            <PurchasePanel
              productId={product.id}
              unit={product.pricing_unit}
              price={product.price}
              min={product.min_quantity}
              step={product.quantity_step}
              max={product.max_quantity}
              stock={product.stock_status}
              currency={settings.currency_symbol}
              variants={variants.map((v) => ({ id: v.id, label_en: v.label_en, label_ta: v.label_ta, price: v.price, stock: v.stock_status }))}
            />
          </div>

          {/* Trust Badges */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-ivory)]/70 p-4 text-xs font-semibold text-[var(--color-forest-900)]">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[var(--color-forest-700)] shrink-0" />
              <span>{lang === "ta" ? "பாரம்பரிய நாட்டு ரகங்கள்" : "100% Traditional Heritage"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-forest-700)] shrink-0" />
              <span>{lang === "ta" ? "இயற்கை முறையில் விளைவித்தது" : "Naturally Cultivated"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--color-forest-700)] shrink-0" />
              <span>{lang === "ta" ? "நேரடி வீட்டு டெலிவரி" : "Safe Doorstep Delivery"}</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-[var(--color-forest-700)] shrink-0" />
              <span>{lang === "ta" ? "சுலபமான வாட்ஸ்அப் ஆர்டர்" : "Easy WhatsApp Order"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section: Generous, readable layout below the buy box */}
      {(description || ingredients || storage) && (
        <div className="mt-12 rounded-3xl border border-[var(--color-line)] bg-white p-6 sm:p-10 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {description && (
              <section className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-forest-50)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-forest-900)]">
                  <span>{t.product.description}</span>
                </div>
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
                  {lang === "ta" ? "உணவுத் தரம் & நன்மைகள்" : "Traditional Goodness & Benefits"}
                </h2>
                <div className="whitespace-pre-line text-[var(--color-muted)] leading-relaxed text-base">
                  {description}
                </div>
              </section>
            )}

            <div className="space-y-6">
              {ingredients && (
                <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-ivory)]/70 p-6">
                  <h3 className="text-lg font-semibold text-[var(--color-forest-900)]">{t.product.ingredients}</h3>
                  <p className="mt-2.5 whitespace-pre-line text-sm text-[var(--color-muted)] leading-relaxed font-medium">
                    {ingredients}
                  </p>
                </section>
              )}

              {storage && (
                <section className="rounded-2xl border border-[var(--color-line)] bg-[#fdfbf7] p-6 shadow-xs">
                  <h3 className="text-lg font-semibold text-[var(--color-ink)]">{t.product.storage}</h3>
                  <p className="mt-2.5 whitespace-pre-line text-sm text-[var(--color-muted)] leading-relaxed">
                    {storage}
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-20 border-t border-[var(--color-line)] pt-12">
          <SectionHeading title={t.product.related} />
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} currency={settings.currency_symbol} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
