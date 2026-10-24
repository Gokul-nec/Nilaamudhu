import type { Lang, PricedLine } from "./types";
import { formatMoney, formatQuantity, UNIT_LABELS } from "./pricing";

export interface WhatsAppCopy {
  brandHeading: string;
  orderTitle: string;
  greeting: string;
  intro: string;
  packSize: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  subtotal: string;
  confirmation?: string;
  closing: string;
  thanks: string;
}

export const WHATSAPP_COPY: Record<Lang, WhatsAppCopy> = {
  en: {
    brandHeading: "Nilaamudhu Traditional Products",
    orderTitle: "Order Request",
    greeting: "Hello {business}!",
    intro: "I would like to place an order for the following items:",
    packSize: "Pack Size",
    quantity: "Quantity",
    unitPrice: "Unit price",
    lineTotal: "Line total",
    subtotal: "Subtotal",
    closing: "Please confirm product availability and delivery charges.",
    thanks: "Thank you!",
  },
  ta: {
    brandHeading: "நிலாமுது பாரம்பரிய உணவுப் பொருட்கள்",
    orderTitle: "புதிய ஆர்டர் விபரம்",
    greeting: "வணக்கம் {business}!",
    intro: "நான் பின்வருவனவற்றை ஆர்டர் செய்ய விரும்புகிறேன்:",
    packSize: "பேக் அளவு",
    quantity: "அளவு",
    unitPrice: "ஒரு அலகு விலை",
    lineTotal: "மொத்தம்",
    subtotal: "கூடுதல் தொகை",
    closing: "பொருட்களின் இருப்பு மற்றும் டெலிவரி கட்டணத்தை உறுதிப்படுத்தவும்.",
    thanks: "நன்றி!",
  },
};

/** Line name with variant in parentheses (used in cart drawer). */
export function lineName(line: PricedLine, lang: Lang): string {
  const base = lang === "ta" && line.name_ta ? line.name_ta : line.name_en;
  const variant = lang === "ta" && line.variantLabel_ta ? line.variantLabel_ta : line.variantLabel_en;
  return variant ? `${base} (${variant})` : base;
}

/** Base product name without variant label. */
export function lineBaseName(line: PricedLine, lang: Lang): string {
  return (lang === "ta" && line.name_ta ? line.name_ta : line.name_en) || "Product";
}

/** Explicit pack size or selling unit (e.g. "500g", "1 kg Pack", "1 kg"). */
export function linePackSize(line: PricedLine, lang: Lang): string {
  if (line.variantId) {
    const rawLabel = (lang === "ta" && line.variantLabel_ta ? line.variantLabel_ta : line.variantLabel_en) || "";
    if (rawLabel.trim()) return rawLabel.trim();
  }
  return `1 ${UNIT_LABELS[line.unit][lang]}`;
}

/** Formatted quantity (e.g. "2 packs", "1 pack", or "2 kg" for loose items). */
export function lineQuantityFormatted(line: PricedLine, lang: Lang): string {
  const qty = formatQuantity(line.quantity);
  if (line.variantId) {
    if (lang === "ta") {
      return `${qty} பாக்கெட்`;
    }
    return line.quantity === 1 ? `${qty} pack` : `${qty} packs`;
  }
  return `${qty} ${UNIT_LABELS[line.unit][lang]}`;
}

/** Legacy quantity text used in cart drawer accessibility labels. */
export function lineQuantityText(line: PricedLine, lang: Lang): string {
  const qty = formatQuantity(line.quantity);
  if (line.variantId) return lang === "ta" ? `${qty} × ${UNIT_LABELS.pack.ta}` : `${qty} × pack`;
  return `${qty} ${UNIT_LABELS[line.unit][lang]}`;
}

export function unitPriceText(line: PricedLine, lang: Lang, symbol: string): string {
  const price = formatMoney(line.unitPricePaise, symbol);
  if (line.variantId) return price;
  return `${price} / ${UNIT_LABELS[line.unit][lang]}`;
}

export function buildOrderMessage(params: {
  lang: Lang;
  businessName: string;
  lines: PricedLine[];
  subtotalPaise: number;
  currencySymbol: string;
}): string {
  const { lang, businessName, lines, subtotalPaise, currencySymbol } = params;
  const t = WHATSAPP_COPY[lang];

  const effectiveBrand = businessName?.trim() || t.brandHeading;
  const shortName = effectiveBrand.replace(/\s*traditional products\s*/i, "").trim() || effectiveBrand;

  const brandHeading = lang === "ta"
    ? `*${effectiveBrand.includes("நிலாமுது") ? effectiveBrand : `${effectiveBrand} - நிலாமுது`}*`
    : `*${effectiveBrand.toLowerCase().includes("traditional") ? effectiveBrand : `${effectiveBrand} Traditional Products`}*`;

  const greetingLine = t.greeting.replace("{business}", shortName);

  const parts: string[] = [
    brandHeading,
    `*${t.orderTitle}*`,
    "",
    greetingLine,
    t.intro,
    "",
  ];

  lines.forEach((line, i) => {
    const productName = lineBaseName(line, lang);
    const packSize = linePackSize(line, lang);
    const qtyText = lineQuantityFormatted(line, lang);
    const unitPrice = unitPriceText(line, lang, currencySymbol);
    const lineTotal = formatMoney(line.linePaise, currencySymbol);

    parts.push(`*${i + 1}. ${productName}*`);
    parts.push(`   • ${t.packSize}: ${packSize}`);
    parts.push(`   • ${t.quantity}: ${qtyText}`);
    parts.push(`   • ${t.unitPrice}: ${unitPrice}`);
    parts.push(`   • ${t.lineTotal}: ${lineTotal}`);
    parts.push(""); // Blank line between products for easy reading
  });

  parts.push(
    "----------------------------------------",
    `*${t.subtotal}: ${formatMoney(subtotalPaise, currencySymbol)}*`,
    "----------------------------------------",
    "",
    t.closing,
    "",
    t.thanks
  );

  return parts.join("\n");
}

/** Returns null when the number is missing or malformed. Digits only, with country code. */
export function buildWhatsAppUrl(number: string | null | undefined, message: string): string | null {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
