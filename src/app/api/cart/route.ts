import { NextResponse } from "next/server";
import { cartRequestSchema } from "@/lib/validation";
import { getProductsByIds, getSettings } from "@/lib/data";
import { priceCart } from "@/lib/cart-pricing";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Prices a cart and builds the WhatsApp link. The browser sends only product ids,
 * package ids and quantities. Prices, names and stock come from the database.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = cartRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_cart" }, { status: 400 });

  try {
    const { items, lang } = parsed.data;
    const [catalogue, settings] = await Promise.all([
      getProductsByIds([...new Set(items.map((i) => i.productId))]),
      getSettings(),
    ]);
    const cart = priceCart(items, catalogue);

    let whatsappUrl: string | null = null;
    const whatsappConfigured = Boolean(settings.whatsapp_number && buildWhatsAppUrl(settings.whatsapp_number, "x"));
    if (whatsappConfigured && !cart.hasBlockingIssue && cart.orderableCount > 0) {
      const message = buildOrderMessage({
        lang,
        businessName: lang === "ta" ? settings.business_name_ta : settings.business_name_en,
        lines: cart.lines,
        subtotalPaise: cart.subtotalPaise,
        currencySymbol: settings.currency_symbol,
      });
      whatsappUrl = buildWhatsAppUrl(settings.whatsapp_number, message);
    }

    return NextResponse.json(
      { ...cart, currencySymbol: settings.currency_symbol, whatsappConfigured, whatsappUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
