"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const FLAG = "nm_splash";

/** Branded intro shown once per browser session, never on later navigations. Capped at ~2s. */
export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return !sessionStorage.getItem(FLAG);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimum = reduced ? 0 : 300;
    const started = performance.now();
    let finished = false;
    document.body.style.overflow = "hidden";

    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem(FLAG, "1"); } catch { /* ignore */ }
      document.body.style.overflow = "";
      setVisible(false);
    };
    const onLoaded = () => setTimeout(finish, Math.max(0, minimum - (performance.now() - started)));

    if (document.readyState === "complete") onLoaded();
    else window.addEventListener("load", onLoaded, { once: true });
    const cap = setTimeout(finish, 600);

    return () => {
      clearTimeout(cap);
      window.removeEventListener("load", onLoaded);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          role="status"
          aria-label="Loading Nilaamudhu"
        >
          <div className="relative h-56 w-56 sm:h-64 sm:w-64">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M40 48 A 82 82 0 1 0 172 128" fill="none" stroke="var(--color-gold-500)" strokeWidth="3.5" strokeLinecap="round" className="draw-stroke" style={{ ["--len" as string]: 330 }} />
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse key={i} cx={112 + (i % 2 ? 9 : -2)} cy={44 + i * 11} rx="4" ry="8.5" transform={`rotate(${i % 2 ? 40 : -40} ${112 + (i % 2 ? 9 : -2)} ${44 + i * 11})`} fill="var(--color-gold-500)" className="grain-pop" style={{ ["--i" as string]: i }} />
              ))}
            </svg>
            <Image src="/logo.png" alt="Nilaamudhu Traditional Products" width={582} height={570} priority className="rise-in absolute inset-0 m-auto h-[88%] w-[88%] object-contain" style={{ ["--d" as string]: "350ms" }} />
          </div>
          <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-sand" aria-hidden>
            <div className="progress-bar h-full w-full rounded-full bg-forest-800" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
