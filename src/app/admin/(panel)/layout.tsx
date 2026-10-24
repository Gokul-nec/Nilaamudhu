import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { signOutAction } from "../actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div lang="en">
      <div className="border-b border-line bg-forest-900 text-cream">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <p className="font-display text-lg font-semibold">Nilaamudhu Admin</p>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {links.map((l) => <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 font-semibold hover:bg-cream/10">{l.label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-cream/70 sm:inline">{user.email}</span>
            <Link href="/" className="underline underline-offset-4">View site</Link>
            <form action={signOutAction}><button type="submit" className="rounded-full border border-cream/30 px-3 py-1.5 font-semibold hover:bg-cream/10">Sign out</button></form>
          </div>
        </div>
      </div>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
