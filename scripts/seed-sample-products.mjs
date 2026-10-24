import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Read .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)?.trim();

if (!clientEmail || !privateKey || !projectId) {
  console.error("Missing Firebase credentials in .env.local");
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = getFirestore(app);

async function seed() {
  console.log("Seeding sample rice category and varieties...");

  // 1. Create or get Category
  const categorySlug = "traditional-rice";
  let categoryId = null;

  const catSnap = await db.collection("categories").where("slug", "==", categorySlug).get();
  if (!catSnap.empty) {
    categoryId = catSnap.docs[0].id;
    console.log(`Using existing category: ${categoryId}`);
  } else {
    const catRef = await db.collection("categories").add({
      slug: categorySlug,
      name_en: "Traditional Rice Varieties",
      name_ta: "பாரம்பரிய அரிசி வகைகள்",
      sort_order: 1,
      is_active: true,
      image_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    categoryId = catRef.id;
    console.log(`Created category "Traditional Rice Varieties" with ID: ${categoryId}`);
  }

  // 2. Define 5 Authentic Tamil Traditional Rice Varieties
  const sampleProducts = [
    {
      slug: "mappillai-samba-rice",
      name_en: "Mappillai Samba Rice (Bridegroom Rice)",
      name_ta: "மாப்பிள்ளை சம்பா அரிசி",
      short_description_en: "Nutrient-rich red rice known for boosting stamina, strength, and immunity.",
      short_description_ta: "உடலுக்கு அளப்பரிய வலிமையும் நோய் எதிர்ப்பு சக்தியும் தரும் பாரம்பரிய சிவப்பு அரிசி.",
      description_en:
        "Mappillai Samba is one of Tamil Nadu's most revered traditional unpolished red rice varieties. Packed with iron, zinc, and dietary fibre, it aids digestion and sustains long-lasting energy.",
      description_ta:
        "பாரம்பரியமாக உடலுழைப்பிற்கும் உடல் உறுதிக்கும் உட்கொள்ளப்பட்ட மாப்பிள்ளை சம்பா அரிசி. இரும்புச்சத்து, துத்தநாகம் மற்றும் நார்ச்சத்து நிறைந்தது.",
      ingredients_en: "100% Naturally Grown Unpolished Mappillai Samba Rice",
      ingredients_ta: "100% இயற்கை முறையில் விளைவிக்கப்பட்ட மாப்பிள்ளை சம்பா தீட்டப்படாத அரிசி",
      storage_en: "Store in an airtight container in a cool, dry place.",
      storage_ta: "காற்று புகாத பாத்திரத்தில் ஈரப்பதமின்றி சேமிக்கவும்.",
      price: 110,
      pricing_unit: "kg",
      min_quantity: 1,
      quantity_step: 1,
      max_quantity: 25,
      stock_status: "in_stock",
      status: "active",
      is_featured: true,
      sort_order: 1,
      variants: [
        { id: "var-ms-1kg", label_en: "1 kg Pack", label_ta: "1 கிலோ", price: 110, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "var-ms-5kg", label_en: "5 kg Bag", label_ta: "5 கிலோ பை", price: 525, stock_status: "in_stock", is_active: true, sort_order: 1 },
      ],
      images: [],
    },
    {
      slug: "karuppu-kavuni-rice",
      name_en: "Karuppu Kavuni Rice (Black Rice)",
      name_ta: "கருப்பு கவுனி அரிசி",
      short_description_en: "Ancient royal black rice loaded with powerful anthocyanin antioxidants.",
      short_description_ta: "அதிக அளவு ஆன்டிஆக்ஸிடன்ட்கள் நிறைந்த ஆரோக்கிய அரச பாரம்பரிய கருப்பு அரிசி.",
      description_en:
        "Karuppu Kavuni is the legendary black rice of Chettinad, celebrated for its dark purple anthocyanin pigment, anti-inflammatory properties, and rich nutty aroma. Perfect for healthy porridge, sweet pongal, and puddings.",
      description_ta:
        "செட்டிநாட்டு பாரம்பரிய கருப்பு கவுனி அரிசி. இதில் உள்ள ஆந்தோசயனின் நச்சுக்களை நீக்கி உடலை இளமையுடன் வைத்திருக்க உதவுகிறது.",
      ingredients_en: "100% Heritage Karuppu Kavuni Black Rice",
      ingredients_ta: "100% தூய பாரம்பரிய கருப்பு கவுனி அரிசி",
      storage_en: "Store in a cool, dry place away from sunlight.",
      storage_ta: "குளிர்ந்த, உலர்ந்த இடத்தில் சூரிய ஒளி படாமல் வைக்கவும்.",
      price: 170,
      pricing_unit: "kg",
      min_quantity: 1,
      quantity_step: 1,
      max_quantity: 15,
      stock_status: "in_stock",
      status: "active",
      is_featured: true,
      sort_order: 2,
      variants: [
        { id: "var-kk-500g", label_en: "500 g Pack", label_ta: "500 கிராம்", price: 90, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "var-kk-1kg", label_en: "1 kg Pack", label_ta: "1 கிலோ", price: 170, stock_status: "in_stock", is_active: true, sort_order: 1 },
      ],
      images: [],
    },
    {
      slug: "seeraga-samba-rice",
      name_en: "Seeraga Samba Rice",
      name_ta: "சீரகச் சம்பா அரிசி",
      short_description_en: "Aromatic fine grain rice prized for authentic biryani and traditional feasts.",
      short_description_ta: "நறுமணமிக்க பாரம்பரிய பிரியாணி மற்றும் விசேஷ சமையலுக்கான பொன்னான அரிசி.",
      description_en:
        "Seeraga Samba has tiny grains resembling cumin seeds (seeragam). Renowned for its distinct fragrance, delicate texture, and easy digestibility, it is the crown jewel of South Indian rice dishes.",
      description_ta:
        "சீரகம் போன்ற சிறிய உருவமும் மனதை மயக்கும் நறுமணமும் கொண்ட சீரகச் சம்பா. பிரியாணி மற்றும் நெய்ச்சோறு சமைக்க தலைசிறந்தது.",
      ingredients_en: "Aged Seeraga Samba Traditional Rice",
      ingredients_ta: "பதப்படுத்தப்பட்ட தூய சீரகச் சம்பா அரிசி",
      storage_en: "Keep in a moisture-free airtight container.",
      storage_ta: "ஈரமில்லாத காற்றுப்புகாத பாத்திரத்தில் அடைத்து வைக்கவும்.",
      price: 130,
      pricing_unit: "kg",
      min_quantity: 1,
      quantity_step: 1,
      max_quantity: 25,
      stock_status: "in_stock",
      status: "active",
      is_featured: true,
      sort_order: 3,
      variants: [
        { id: "var-ss-1kg", label_en: "1 kg Pack", label_ta: "1 கிலோ", price: 130, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "var-ss-5kg", label_en: "5 kg Bag", label_ta: "5 கிலோ பை", price: 620, stock_status: "in_stock", is_active: true, sort_order: 1 },
      ],
      images: [],
    },
    {
      slug: "poongar-rice",
      name_en: "Poongar Traditional Rice",
      name_ta: "பூங்கார் அரிசி",
      short_description_en: "Reddish native rice cherished for women's wellness and hormone balance.",
      short_description_ta: "பெண்களின் உடல் நலத்தையும் ஹார்மோன் சமநிலையையும் காக்கும் பாரம்பரிய சிவப்பு அரிசி.",
      description_en:
        "Poongar rice is a resilient traditional paddy variety traditionally consumed by women during pregnancy and post-natal care. Rich in calcium and iron, it makes soft idlis, dosas, and nourishing kanji.",
      description_ta:
        "பெண்களின் நலம் காக்கும் பூங்கார் அரிசி. சுவையான இட்லி, தோசை மாவு மற்றும் கஞ்சி தயாரிக்க மிகவும் ஏற்றது.",
      ingredients_en: "100% Unpolished Poongar Rice",
      ingredients_ta: "100% தீட்டப்படாத பூங்கார் அரிசி",
      storage_en: "Store in a cool and dry container.",
      storage_ta: "குளிர்ந்த மற்றும் உலர்ந்த இடத்தில் வைக்கவும்.",
      price: 105,
      pricing_unit: "kg",
      min_quantity: 1,
      quantity_step: 1,
      max_quantity: 25,
      stock_status: "in_stock",
      status: "active",
      is_featured: false,
      sort_order: 4,
      variants: [
        { id: "var-pg-1kg", label_en: "1 kg Pack", label_ta: "1 கிலோ", price: 105, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "var-pg-5kg", label_en: "5 kg Bag", label_ta: "5 கிலோ பை", price: 500, stock_status: "in_stock", is_active: true, sort_order: 1 },
      ],
      images: [],
    },
    {
      slug: "kattuyanam-rice",
      name_en: "Kattuyanam Traditional Rice",
      name_ta: "காட்டுயானம் அரிசி",
      short_description_en: "Heritage giant paddy variety with low glycemic index for diabetic care.",
      short_description_ta: "சர்க்கரை அளவைக் கட்டுப்படுத்தவும் மூட்டு உறுதிக்கும் உதவும் பாரம்பரிய காட்டுயானம் அரிசி.",
      description_en:
        "Kattuyanam gets its name because its wild crop grows so tall that even elephants could hide behind it. Renowned for its low glycemic index, it aids in diabetes management and promotes bone strength.",
      description_ta:
        "யானையே மறையும் அளவிற்கு உயரமாக வளரும் பாரம்பரிய காட்டுயானம் நெற்பயிர். குறைவான கிளைசெமிக் குறியீடு கொண்டது, நீரிழிவு நோயாளிகளுக்கு மிகச் சிறந்தது.",
      ingredients_en: "100% Traditional Kattuyanam Rice",
      ingredients_ta: "100% பாரம்பரிய காட்டுயானம் அரிசி",
      storage_en: "Store tightly sealed in a cool, dry area.",
      storage_ta: "நன்கு மூடி குளிர்ந்த, காய்ந்த இடத்தில் வைக்கவும்.",
      price: 125,
      pricing_unit: "kg",
      min_quantity: 1,
      quantity_step: 1,
      max_quantity: 25,
      stock_status: "in_stock",
      status: "active",
      is_featured: false,
      sort_order: 5,
      variants: [
        { id: "var-ky-1kg", label_en: "1 kg Pack", label_ta: "1 கிலோ", price: 125, stock_status: "in_stock", is_active: true, sort_order: 0 },
        { id: "var-ky-5kg", label_en: "5 kg Bag", label_ta: "5 கிலோ பை", price: 590, stock_status: "in_stock", is_active: true, sort_order: 1 },
      ],
      images: [],
    },
  ];

  for (const product of sampleProducts) {
    const existingSnap = await db.collection("products").where("slug", "==", product.slug).get();
    const docData = {
      ...product,
      category_id: categoryId,
      updated_at: new Date().toISOString(),
    };

    if (!existingSnap.empty) {
      await db.collection("products").doc(existingSnap.docs[0].id).set(docData, { merge: true });
      console.log(`Updated product: ${product.name_en}`);
    } else {
      const ref = await db.collection("products").add({
        ...docData,
        created_at: new Date().toISOString(),
      });
      console.log(`Added product: ${product.name_en} (${ref.id})`);
    }
  }

  // 3. Make sure site settings has defaults so WhatsApp order notice is clean
  const settingsDoc = await db.collection("settings").doc("site").get();
  if (!settingsDoc.exists) {
    await db.collection("settings").doc("site").set({
      business_name_en: "Nilaamudhu Traditional Products",
      business_name_ta: "நிலாமுது பாரம்பரியப் பொருட்கள்",
      tagline_en: "From our soil to your home",
      tagline_ta: "எங்கள் மண்ணில் இருந்து உங்கள் இல்லத்துக்கு",
      announcement_en: "Fresh harvest traditional rice varieties now in stock!",
      announcement_ta: "புதிய அறுவடை பாரம்பரிய அரிசி வகைகள் இப்போது கிடைக்கின்றன!",
      currency_symbol: "₹",
      default_language: "en",
      updated_at: new Date().toISOString(),
    });
    console.log("Initialized default site settings.");
  }

  console.log("\nAll 5 sample rice varieties added successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
