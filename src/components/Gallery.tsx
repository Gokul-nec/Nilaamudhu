"use client";

import Image from "next/image";
import { useState } from "react";
import { useLang } from "./Providers";
import { PlaceholderImage } from "./ui";

export function Gallery({ images, name }: { images: { src: string; alt: string }[]; name: string }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line"><PlaceholderImage label={t.common.placeholderImage} /></div>;
  }
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div role="group" aria-label={t.product.gallery}>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line bg-ivory">
        <Image src={current.src} alt={current.alt || name} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button type="button" onClick={() => setActive(i)} aria-label={`${name} ${i + 1}`} aria-current={i === active}
                className={`relative block h-16 w-16 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-20 ${i === active ? "border-forest-800" : "border-transparent opacity-80 hover:opacity-100"}`}>
                <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
