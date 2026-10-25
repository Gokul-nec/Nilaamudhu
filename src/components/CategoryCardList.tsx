"use client";

import Image from "next/image";
import Link from "next/link";
import { Wheat } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Category, Lang } from "@/lib/types";
import { pick } from "@/lib/i18n/lang";
import { imageUrl } from "@/lib/product-utils";
import { useLang } from "./Providers";

export function CategoryCardList({
  categories,
  lang: initialLang = "en",
}: {
  categories: Category[];
  lang?: Lang;
}) {
  const { lang: currentLang } = useLang();
  const lang = currentLang ?? initialLang;
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: prefersReduced
        ? { duration: 0.1 }
        : {
            staggerChildren: 0.08,
            delayChildren: 0.05,
          },
    },
  };

  const itemVariants: Variants = {
    hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
    >
      {categories.map((c) => {
        const name = pick(lang, c.name_en, c.name_ta);
        const src = imageUrl(c.image_path);
        return (
          <motion.div
            key={c.id}
            variants={itemVariants}
            className="transition-transform duration-300 hover:-translate-y-1"
          >
            <Link
              href={`/products?category=${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-[var(--radius-card-lg)] p-5 text-center transition-all duration-300 hover:bg-[var(--color-ivory)] hover:shadow-[var(--shadow-lift)]"
            >
              {/* Round image with overflow hidden frame */}
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--color-sand)] bg-[var(--color-ivory)] shadow-md transition-all duration-500 group-hover:scale-105 group-hover:border-[var(--color-gold-500)] sm:h-28 sm:w-28">
                {src ? (
                  <Image
                    src={src}
                    alt={name.text}
                    fill
                    sizes="(min-width:1024px) 112px, 96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[var(--color-forest-700)]/60">
                    <Wheat className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
              </div>
              <p className="font-semibold text-[var(--color-ink)] leading-snug transition-colors duration-300 group-hover:text-[var(--color-forest-900)]">
                {name.text}
              </p>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
