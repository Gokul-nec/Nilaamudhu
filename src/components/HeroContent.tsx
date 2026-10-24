"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import type { Lang } from "@/lib/types";

interface StatItem {
  num: string;
  label: string;
}

interface HeroContentProps {
  lang: Lang;
  headline: string;
  heroLead: string;
  shopNowText: string;
  browseCategoriesText: string;
  stats: StatItem[];
  directFromFarmsText: string;
}

function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? value : "0%");

  useEffect(() => {
    if (!isInView || prefersReduced) {
      if (prefersReduced) setDisplayValue(value);
      return;
    }

    const match = value.match(/(\d+)(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const target = parseInt(match[1], 10);
    const suffix = match[2] || "%";

    const controls = animate(0, target, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as const,
      onUpdate: (latest) => {
        setDisplayValue(`${Math.round(latest)}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [isInView, value, prefersReduced]);

  return <span ref={ref}>{displayValue}</span>;
}

export function HeroContent({
  lang,
  headline,
  heroLead,
  shopNowText,
  browseCategoriesText,
  stats,
  directFromFarmsText,
}: HeroContentProps) {
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: prefersReduced
        ? { duration: 0.1 }
        : {
            staggerChildren: 0.12,
            delayChildren: 0.08,
          },
    },
  };

  const itemVariants: Variants = {
    hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col"
    >
      {/* 1. Natural · Wholesome Badge */}
      <motion.div variants={itemVariants} className="mb-5 inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-forest-100)] bg-[var(--color-forest-50)] px-4 py-1.5 text-sm font-semibold text-[var(--color-forest-800)] shadow-xs">
        <Leaf className="h-4 w-4 text-[var(--color-forest-700)]" aria-hidden="true" />
        <span>{lang === "ta" ? "இயற்கை • ஆரோக்கியமான" : "Natural · Wholesome"}</span>
      </motion.div>

      {/* 2. Heading */}
      <motion.h1
        id="hero-heading"
        variants={itemVariants}
        className="text-[var(--color-ink)]"
      >
        {headline || (lang === "ta" ? "தூய இயற்கையின் சுவை" : "Pure Taste of Nature")}
      </motion.h1>

      {/* 3. Subtext */}
      <motion.p
        variants={itemVariants}
        className="mt-5 max-w-xl text-lg text-[var(--color-muted)] leading-relaxed"
      >
        {heroLead}
      </motion.p>

      {/* 4. Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <Link
          href="/products"
          className="btn btn-primary group !px-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span>{shopNowText}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        <a
          href="#categories"
          className="btn btn-secondary !px-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          {browseCategoriesText}
        </a>
      </motion.div>

      {/* 5. Trust / Stats Row */}
      <motion.div
        variants={itemVariants}
        className="mt-10 flex flex-wrap items-center gap-6 border-t border-[var(--color-line)] pt-7"
      >
        {stats.map((p) => (
          <div
            key={p.label}
            className="promise-pill transition-transform duration-300 hover:-translate-y-0.5"
          >
            <strong className="text-xl font-bold text-[var(--color-forest-900)] tabular-nums">
              <StatNumber value={p.num} />
            </strong>
            <span className="text-[0.68rem] uppercase tracking-widest text-[var(--color-muted)]">
              {p.label}
            </span>
          </div>
        ))}
        <div className="ml-auto hidden items-center gap-2 rounded-full bg-[var(--color-ivory)] px-4 py-2 sm:flex shadow-xs transition-transform duration-300 hover:scale-105">
          <ShieldCheck className="h-4 w-4 text-[var(--color-forest-700)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--color-muted)]">
            {directFromFarmsText}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
