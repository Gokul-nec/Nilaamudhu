import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getLang } from "@/lib/data";
import { dictionaries } from "@/lib/i18n/dictionary";
import { AdminNav } from "@/components/admin/AdminNav";
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
      <div className="border-b border-line bg-forest-900 text-cream shadow-xs">
        <div className="container-page py-2.5 sm:py-3">
          {/* Mobile view (< md): Clean, structured 2-row layout */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-display text-base font-semibold text-white tracking-tight truncate">
                  {t.brand}
                </span>
                <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream/90">
                  Panel
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <Link
                  href="/"
                  className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-cream hover:bg-white/20 transition-colors"
                >
                  {t.viewSite}
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-cream/30 px-2.5 py-1 font-semibold text-cream hover:bg-cream/10 transition-colors"
                  >
                    {t.signOut}
                  </button>
                </form>
              </div>
            </div>

            <AdminNav links={links} />
          </div>

          {/* Desktop view (>= md): Exactly identical to the original layout */}
          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2">
            <p className="font-display text-lg font-semibold shrink-0">{t.brand}</p>
            <AdminNav links={links} />
            <div className="ml-auto flex items-center gap-3 text-sm shrink-0">
              <span className="text-cream/70">{user.email}</span>
              <Link href="/" className="underline underline-offset-4 hover:text-white transition-colors">
                {t.viewSite}
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-cream/30 px-3 py-1.5 font-semibold hover:bg-cream/10 transition-colors"
                >
                  {t.signOut}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
