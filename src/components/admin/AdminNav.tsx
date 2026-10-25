"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 md:flex-wrap md:overflow-visible"
    >
      {links.map((l) => {
        const isActive =
          l.href === "/admin/dashboard"
            ? pathname === "/admin/dashboard" || pathname === "/admin"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? "bg-cream text-forest-900 shadow-xs font-bold"
                : "text-cream/90 hover:bg-cream/15 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
