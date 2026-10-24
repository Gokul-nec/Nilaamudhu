import { describe, expect, it } from "vitest";
import { clampQuantity, formatMoney, isValidQuantity, lineTotalPaise, toPaise } from "./pricing";
import { priceCart } from "./cart-pricing";
import { buildOrderMessage, buildWhatsAppUrl } from "./whatsapp";
import { imageUrl } from "./product-utils";
import { categoryFormSchema, imageFormSchema } from "./validation";
import type { Product } from "./types";

const base = (over: Partial<Product>): Product => ({
  id: "p1", slug: "test", category_id: null, name_en: "Test Rice", name_ta: "சோதனை அரிசி",
  short_description_en: null, short_description_ta: null, description_en: null, description_ta: null,
  ingredients_en: null, ingredients_ta: null, storage_en: null, storage_ta: null,
  price: 100, pricing_unit: "kg", min_quantity: 0.5, quantity_step: 0.5, max_quantity: 25,
  stock_status: "in_stock", status: "active", is_featured: false, sort_order: 0,
  updated_at: "2026-01-01", product_images: [], product_variants: [], ...over,
});

describe("pricing", () => {
  it("avoids float drift", () => {
    expect(toPaise(19.99)).toBe(1999);
    expect(lineTotalPaise(toPaise(0.1), 3)).toBe(30);
    expect(lineTotalPaise(8999, 1.5)).toBe(13499); // 89.99 x 1.5 = 134.985 -> rounds
  });
  it("validates quantity steps", () => {
    const rule = { min: 0.5, step: 0.5, max: 25 };
    expect(isValidQuantity(0.5, rule)).toBe(true);
    expect(isValidQuantity(1.5, rule)).toBe(true);
    expect(isValidQuantity(0.7, rule)).toBe(false);
    expect(isValidQuantity(0, rule)).toBe(false);
    expect(isValidQuantity(-1, rule)).toBe(false);
    expect(isValidQuantity(26, rule)).toBe(false);
    expect(isValidQuantity(Number.NaN, rule)).toBe(false);
    expect(isValidQuantity(Infinity, rule)).toBe(false);
  });
  it("clamps quantities", () => {
    const rule = { min: 0.5, step: 0.5, max: 25 };
    expect(clampQuantity(0.1, rule)).toBe(0.5);
    expect(clampQuantity(99, rule)).toBe(25);
    expect(clampQuantity(1.2, rule)).toBe(1);
  });
  it("formats money", () => {
    expect(formatMoney(12000)).toBe("₹120");
    expect(formatMoney(12050)).toBe("₹120.50");
    expect(formatMoney(12345600)).toBe("₹1,23,456");
  });
});

describe("priceCart", () => {
  const catalogue = new Map<string, Product>([
    ["p1", base({})],
    ["p2", base({ id: "p2", name_en: "Out", stock_status: "out_of_stock" })],
    ["p3", base({
      id: "p3", name_en: "Packed", price: null, pricing_unit: "pack",
      product_variants: [
        { id: "v1", product_id: "p3", label_en: "500 g", label_ta: "500 கி", price: 60, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "v2", product_id: "p3", label_en: "1 kg", label_ta: null, price: 110, stock_status: "out_of_stock", is_active: true, sort_order: 1 },
      ],
    })],
  ]);

  it("prices multiple lines from trusted data and sums the subtotal", () => {
    const cart = priceCart([
      { productId: "p1", variantId: null, quantity: 1.5 },
      { productId: "p3", variantId: "v1", quantity: 2 },
    ], catalogue);
    expect(cart.lines[0].linePaise).toBe(15000);
    expect(cart.lines[1].linePaise).toBe(12000);
    expect(cart.subtotalPaise).toBe(27000);
    expect(cart.hasBlockingIssue).toBe(false);
  });
  it("flags unknown, out of stock, invalid quantity and bad variant lines", () => {
    const cart = priceCart([
      { productId: "ghost", variantId: null, quantity: 1 },
      { productId: "p2", variantId: null, quantity: 1 },
      { productId: "p1", variantId: null, quantity: 0.7 },
      { productId: "p3", variantId: "nope", quantity: 1 },
      { productId: "p3", variantId: "v2", quantity: 1 },
      { productId: "p3", variantId: null, quantity: 1 },
    ], catalogue);
    expect(cart.lines.map((l) => l.issue)).toEqual([
      "unavailable", "out_of_stock", "invalid_quantity", "variant_unavailable", "out_of_stock", "variant_unavailable",
    ]);
    expect(cart.hasBlockingIssue).toBe(true);
    expect(cart.subtotalPaise).toBe(0);
  });
  it("ignores duplicate cart keys", () => {
    const cart = priceCart([
      { productId: "p1", variantId: null, quantity: 1 },
      { productId: "p1", variantId: null, quantity: 5 },
    ], catalogue);
    expect(cart.lines).toHaveLength(1);
  });
});

describe("WhatsApp", () => {
  const catalogue = new Map<string, Product>([["p1", base({})]]);
  const cart = priceCart([{ productId: "p1", variantId: null, quantity: 2 }], catalogue);

  it("builds the English message", () => {
    const msg = buildOrderMessage({ lang: "en", businessName: "Nilaamudhu", lines: cart.lines, subtotalPaise: cart.subtotalPaise, currencySymbol: "₹" });
    expect(msg).toContain("Nilaamudhu Traditional Products");
    expect(msg).toContain("Hello Nilaamudhu!");
    expect(msg).toContain("1. Test Rice");
    expect(msg).toContain("Pack Size: 1 kg");
    expect(msg).toContain("Quantity: 2 kg");
    expect(msg).toContain("Unit price: ₹100 / kg");
    expect(msg).toContain("Line total: ₹200");
    expect(msg).toContain("Subtotal: ₹200");
    expect(msg).toContain("Please confirm product availability and delivery charges.");
    expect(msg).toContain("Thank you!");
    expect(msg).not.toContain("|"); // No markdown tables
  });

  it("builds a multi-product order with variant pack sizes and accurate line totals and subtotal", () => {
    const multiCat = new Map<string, Product>([
      [
        "toor",
        base({
          id: "toor",
          name_en: "Toor Dal (Thuvaram Paruppu)",
          name_ta: "துவரம் பருப்பு",
          product_variants: [
            { id: "toor-500g", product_id: "toor", label_en: "500g", label_ta: "500 கிராம்", price: 110, stock_status: "in_stock", is_active: true, sort_order: 0 },
            { id: "toor-1kg", product_id: "toor", label_en: "1kg", label_ta: "1 கிலோ", price: 210, stock_status: "in_stock", is_active: true, sort_order: 1 },
          ],
        }),
      ],
      [
        "kavuni",
        base({
          id: "kavuni",
          name_en: "Karuppu Kavuni Rice",
          name_ta: "கருப்பு கவுனி அரிசி",
          product_variants: [
            { id: "kav-1kg", product_id: "kavuni", label_en: "1kg", label_ta: "1 கிலோ", price: 180, stock_status: "in_stock", is_active: true, sort_order: 0 },
          ],
        }),
      ],
      [
        "seeraga",
        base({
          id: "seeraga",
          name_en: "Seeraga Samba Rice",
          name_ta: "சீரக சம்பா அரிசி",
          price: 130,
          pricing_unit: "kg",
          min_quantity: 1,
          quantity_step: 1,
          product_variants: [],
        }),
      ],
    ]);

    const multiCart = priceCart(
      [
        { productId: "toor", variantId: "toor-500g", quantity: 2 },
        { productId: "kavuni", variantId: "kav-1kg", quantity: 1 },
        { productId: "seeraga", variantId: null, quantity: 3 },
      ],
      multiCat,
    );

    expect(multiCart.lines).toHaveLength(3);
    expect(multiCart.lines[0].linePaise).toBe(22000); // 2 * 110 = 220
    expect(multiCart.lines[1].linePaise).toBe(18000); // 1 * 180 = 180
    expect(multiCart.lines[2].linePaise).toBe(39000); // 3 * 130 = 390
    expect(multiCart.subtotalPaise).toBe(79000); // 220 + 180 + 390 = 790

    const msg = buildOrderMessage({
      lang: "en",
      businessName: "Nilaamudhu",
      lines: multiCart.lines,
      subtotalPaise: multiCart.subtotalPaise,
      currencySymbol: "₹",
    });

    // Check heading & greeting
    expect(msg).toContain("*Nilaamudhu Traditional Products*");
    expect(msg).toContain("Hello Nilaamudhu!");

    // Check product 1
    expect(msg).toContain("*1. Toor Dal (Thuvaram Paruppu)*");
    expect(msg).toContain("Pack Size: 500g");
    expect(msg).toContain("Quantity: 2 packs");
    expect(msg).toContain("Unit price: ₹110");
    expect(msg).toContain("Line total: ₹220");

    // Check product 2
    expect(msg).toContain("*2. Karuppu Kavuni Rice*");
    expect(msg).toContain("Pack Size: 1kg");
    expect(msg).toContain("Quantity: 1 pack");
    expect(msg).toContain("Unit price: ₹180");
    expect(msg).toContain("Line total: ₹180");

    // Check product 3 (loose kg pricing)
    expect(msg).toContain("*3. Seeraga Samba Rice*");
    expect(msg).toContain("Pack Size: 1 kg");
    expect(msg).toContain("Quantity: 3 kg");
    expect(msg).toContain("Unit price: ₹130 / kg");
    expect(msg).toContain("Line total: ₹390");

    // Check subtotal
    expect(msg).toContain("*Subtotal: ₹790*");

    // Check confirmation notice and thank you
    expect(msg).toContain("Please confirm product availability and delivery charges.");
    expect(msg).toContain("Thank you!");

    // Verify separation by blank lines between products
    const product1Index = msg.indexOf("*1. Toor Dal (Thuvaram Paruppu)*");
    const product2Index = msg.indexOf("*2. Karuppu Kavuni Rice*");
    const product3Index = msg.indexOf("*3. Seeraga Samba Rice*");
    const subtotalIndex = msg.indexOf("*Subtotal: ₹790*");

    expect(product1Index).toBeLessThan(product2Index);
    expect(product2Index).toBeLessThan(product3Index);
    expect(product3Index).toBeLessThan(subtotalIndex);

    // Verify blank lines between products
    const between1And2 = msg.slice(product1Index, product2Index);
    expect(between1And2).toMatch(/\n\n/);

    const between2And3 = msg.slice(product2Index, product3Index);
    expect(between2And3).toMatch(/\n\n/);

    // URL encode test
    const url = buildWhatsAppUrl("919876543210", msg)!;
    expect(url.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(msg);
  });

  it("builds a Tamil message that survives URL encoding", () => {
    const msg = buildOrderMessage({ lang: "ta", businessName: "நிலாமுது", lines: cart.lines, subtotalPaise: cart.subtotalPaise, currencySymbol: "₹" });
    expect(msg).toContain("சோதனை அரிசி");
    expect(msg).toContain("நிலாமுது");
    expect(msg).toContain("பொருட்களின் இருப்பு மற்றும் டெலிவரி கட்டணத்தை உறுதிப்படுத்தவும்.");
    expect(msg).toContain("நன்றி!");
    const url = buildWhatsAppUrl("919876543210", msg)!;
    expect(url.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(url).not.toMatch(/[\u0B80-\u0BFF\s]/);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(msg);
  });

  it("returns null for missing or malformed numbers", () => {
    expect(buildWhatsAppUrl(null, "x")).toBeNull();
    expect(buildWhatsAppUrl("", "x")).toBeNull();
    expect(buildWhatsAppUrl("123", "x")).toBeNull();
    expect(buildWhatsAppUrl("+91 98765-43210", "x")).toContain("wa.me/919876543210");
  });
});

describe("Cloudinary image integration", () => {
  it("resolves Cloudinary HTTPS URLs correctly in imageUrl helper", () => {
    const cloudinaryUrl = "https://res.cloudinary.com/m9plcftb/image/upload/v1729600000/nilaamudhu/products/test.jpg";
    expect(imageUrl(cloudinaryUrl)).toBe(cloudinaryUrl);
  });

  it("validates Cloudinary URLs in product image schema", () => {
    const cloudinaryUrl = "https://res.cloudinary.com/m9plcftb/image/upload/v1729600000/nilaamudhu/products/test.webp";
    const res = imageFormSchema.safeParse({ path: cloudinaryUrl, alt_en: "Organic rice", alt_ta: "இயற்கை அரிசி" });
    expect(res.success).toBe(true);
  });

  it("validates Cloudinary URLs in category schema", () => {
    const cloudinaryUrl = "https://res.cloudinary.com/m9plcftb/image/upload/v1729600000/nilaamudhu/categories/traditional-rice.webp";
    const res = categoryFormSchema.safeParse({
      name_en: "Traditional Rice",
      name_ta: "பாரம்பரிய அரிசி",
      slug: "traditional-rice",
      sort_order: "1",
      is_active: true,
      image_path: cloudinaryUrl,
    });
    expect(res.success).toBe(true);
  });
});
