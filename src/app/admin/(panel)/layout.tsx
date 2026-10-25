import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { signOutAction } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [{ user }, lang] = await Promise.all([requireAdmin(), getLang()]);
  const t = dictionaries[lang].admin.nav;

  const links = [
    { href: "/admin/dashboard", label: t.dashboard },
    { href: "/admin/products", label: t.products },
    { href: "/admin/categories", label: t.categories },
    { href: "/admin/settings", label: t.settings },
  ];

  return (
    <div lang={lang}>
      <div className="border-b border-line bg-forest-900 text-cream">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <p className="font-display text-lg font-semibold">{t.brand}</p>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 font-semibold hover:bg-cream/10">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-cream/70 sm:inline">{user.email}</span>
            <Link href="/" className="underline underline-offset-4">
              {t.viewSite}
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="rounded-full border border-cream/30 px-3 py-1.5 font-semibold hover:bg-cream/10">
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
