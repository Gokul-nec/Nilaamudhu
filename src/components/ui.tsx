import Link from "next/link";
import { ChevronRight, Wheat } from "lucide-react";
import type { Lang, StockStatus } from "@/lib/types";
import { dictionaries } from "@/lib/i18n/dictionary";

export function StockBadge({ status, lang }: { status: StockStatus; lang: Lang }) {
  const t = dictionaries[lang].common;
  const map = {
    in_stock: { label: t.inStock, cls: "bg-[var(--color-forest-100)] text-[var(--color-forest-900)]" },
    limited: { label: t.limited, cls: "bg-[#fef3da] text-[var(--color-gold-700)]" },
    out_of_stock: { label: t.outOfStock, cls: "bg-[#fde8e4] text-[var(--color-danger)]" },
  }[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map.cls}`}>{map.label}</span>;
}

export function PlaceholderImage({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--color-ivory)] text-[var(--color-forest-700)]/60 ${className}`} role="img" aria-label={label}>
      <Wheat className="h-10 w-10" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {item.href ? <Link href={item.href} className="underline-offset-4 hover:text-forest-800 hover:underline">{item.label}</Link>
              : <span aria-current="page" className="text-ink">{item.label}</span>}
            {i < items.length - 1 && <ChevronRight className="h-4 w-4" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}

export { SectionHeading } from "./SectionHeading";
