"use client";

import { motion } from "framer-motion";

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div className="relative inline-block">
        <h2 className="text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">{title}</h2>
        {/* Gold underline that draws itself from left to right when scrolled into view */}
        <motion.div
          className="mt-2.5 h-[3px] rounded-full bg-gradient-to-r from-[var(--color-gold-500)] via-[var(--color-gold-300)] to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
          style={{ originX: 0, width: "120px" }}
          aria-hidden="true"
        />
      </div>
      {action}
    </div>
  );
}
