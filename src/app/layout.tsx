import type { Metadata, Viewport } from "next";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/noto-serif-tamil/500.css";
import "@fontsource/noto-serif-tamil/600.css";
import "@fontsource/hind-madurai/400.css";
import "@fontsource/hind-madurai/500.css";
import "@fontsource/hind-madurai/600.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SplashScreen } from "@/components/SplashScreen";
import { getLang, getSettings } from "@/lib/data";
import { pick } from "@/lib/i18n/lang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, lang] = await Promise.all([getSettings(), getLang()]);
  const name = pick(lang, settings.business_name_en, settings.business_name_ta).text;
  const description = lang === "ta"
    ? "பாரம்பரிய அரிசி வகைகள், தானியங்கள் மற்றும் சிறுதானியங்கள். வாட்ஸ்அப்பில் எளிதாக ஆர்டர் செய்யுங்கள்."
    : "Traditional rice varieties, grains and millets. Order easily on WhatsApp.";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${settings.business_name_en} · ${settings.business_name_ta}`, template: `%s | ${settings.business_name_en}` },
    description,
    applicationName: name,
    openGraph: { type: "website", siteName: settings.business_name_en, title: `${settings.business_name_en} · ${settings.business_name_ta}`, description, images: [{ url: "/logo.png", width: 582, height: 570, alt: settings.business_name_en }] },
    twitter: { card: "summary", title: settings.business_name_en, description },
    alternates: { canonical: "/" },
    icons: { icon: "/logo.png", apple: "/logo.png" },
  };
}

export const viewport: Viewport = { themeColor: "#fbf7ef", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, settings] = await Promise.all([getLang(), getSettings()]);
  const name = pick(lang, settings.business_name_en, settings.business_name_ta).text;
  const announcement = pick(lang, settings.announcement_en, settings.announcement_ta).text;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('nm_splash'))document.documentElement.classList.add('splash-seen')}catch(e){}" }} />
      </head>
      <body>
        <Providers initialLang={lang}>
          <SplashScreen />
          <AnnouncementBar announcementEn={settings.announcement_en} announcementTa={settings.announcement_ta} />
          <Header businessNameEn={settings.business_name_en} businessNameTa={settings.business_name_ta} businessName={name} />
          <main id="main">{children}</main>
          <Footer settings={settings} lang={lang} />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
