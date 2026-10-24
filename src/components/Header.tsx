"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBasket, X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCart, useLang } from "./Providers";
import type { Lang } from "@/lib/types";

function LanguageToggle() {
  const { lang, setLang, switching } = useLang();
  const options: { value: Lang; label: string; aria: string }[] = [
    { value: "en", label: "EN", aria: "English" },
    { value: "ta", label: "தமிழ்", aria: "தமிழ்" },
  ];
  return (
    <div
      role="group"
      aria-label="Language"
      className={`relative inline-flex rounded-full border border-[var(--color-line)] bg-white p-0.5 shadow-xs ${switching ? "opacity-70" : ""}`}
    >
      {options.map((o) => {
        const isActive = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.value}
            aria-label={o.aria}
            aria-pressed={isActive}
            onClick={() => !isActive && setLang(o.value)}
            className="relative min-h-9 min-w-11 rounded-full px-3 text-sm font-semibold transition-colors duration-200 z-10"
          >
            {isActive && (
              <motion.span
                layoutId="active-lang-pill"
                className="absolute inset-0 rounded-full bg-[var(--color-forest-900)] shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span
              className={
                isActive
                  ? "text-white"
                  : "text-[var(--color-forest-900)] hover:text-[var(--color-forest-800)]"
              }
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SearchForm({ onDone, className = "" }: { onDone?: () => void; className?: string }) {
  const { t } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const value = q.trim();
        router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
        onDone?.();
      }}
    >
      <label htmlFor={`search-${className.length}`} className="sr-only">
        {t.nav.search}
      </label>
      <input
        id={`search-${className.length}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.nav.searchPlaceholder}
        maxLength={60}
        className="field pr-11 !rounded-full !border-[var(--color-line)] bg-[var(--color-ivory)] focus:bg-white text-sm"
      />
      <button
        type="submit"
        aria-label={t.nav.search}
        className="absolute top-1/2 right-1.5 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--color-forest-800)] hover:bg-[var(--color-forest-50)]"
      >
        <Search className="h-4.5 w-4.5" aria-hidden />
      </button>
    </form>
  );
}

export function Header({ businessName }: { businessName: string }) {
  const { t } = useLang();
  const { count, hydrated, setOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const logoClicks = useRef(0);
  const logoTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Secret keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        router.push("/admin/login");
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [router]);

  const handleLogoClick = (e: React.MouseEvent) => {
    logoClicks.current += 1;
    if (logoTimer.current) clearTimeout(logoTimer.current);

    // Secret 3-click or 3-tap trigger on the logo
    if (logoClicks.current >= 3) {
      e.preventDefault();
      logoClicks.current = 0;
      router.push("/admin/login");
      return;
    }

    logoTimer.current = setTimeout(() => {
      logoClicks.current = 0;
    }, 1200);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.shop },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-40 bg-[var(--color-cream)]/95 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? "shadow-[0_4px_24px_rgba(43,29,20,0.08)] py-0 border-b border-[var(--color-line)]/60"
          : "border-b border-[var(--color-line)]"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[var(--color-forest-900)] focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>

      {/* Main navigation row */}
      <div
        className={`container-page flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 ${
          scrolled ? "py-1.5 sm:py-2" : "py-2.5 sm:py-3"
        }`}
      >
        {/* Left: Mobile menu trigger + Brand logo & title */}
        <div className="flex items-center gap-3">
          <button
            ref={menuButton}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.nav.close : t.nav.menu}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-line)] hover:bg-[var(--color-ivory)] md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>

          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex shrink-0 items-center gap-3"
            aria-label={businessName}
          >
            <Image
              src="/logo.png"
              alt=""
              width={582}
              height={570}
              priority
              className={`w-auto transition-all duration-300 hover:scale-105 ${
                scrolled ? "h-9 sm:h-12" : "h-11 sm:h-14"
              }`}
            />
            <span className="font-display text-lg sm:text-xl font-semibold text-[var(--color-ink)] tracking-tight">
              {businessName}
            </span>
          </Link>
        </div>

        {/* Center: Desktop links */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(l.href)
                  ? "bg-[var(--color-forest-100)] text-[var(--color-forest-900)]"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: Search, Language toggle, Cart, WhatsApp */}
        <div className="flex items-center gap-2">
          <SearchForm className="hidden w-52 lg:block xl:w-72" />
          <LanguageToggle />

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`${t.cart.open}${hydrated ? ` (${count})` : ""}`}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-[var(--color-forest-900)] text-white transition-colors hover:bg-[var(--color-forest-800)] shadow-[var(--shadow-green)]"
          >
            <ShoppingBasket className="h-5 w-5" aria-hidden />
            {hydrated && count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [1.35, 0.9, 1], opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--color-gold-500)] px-1 text-xs font-bold text-[var(--color-forest-950)] shadow-xs"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary slim sub-bar on mobile/desktop for search & WhatsApp */}
      <div className="border-t border-[var(--color-line)] bg-[var(--color-ivory)]/40 md:hidden">
        <div className="container-page py-2">
          <SearchForm className="w-full" />
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-[var(--color-line)] bg-[var(--color-cream)] md:hidden">
          <div className="container-page space-y-4 py-4">
            <nav aria-label="Mobile" className="flex flex-col space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-lg font-semibold transition-colors ${
                    isActive(l.href)
                      ? "bg-[var(--color-forest-100)] text-[var(--color-forest-900)]"
                      : "text-[var(--color-ink)] hover:bg-[var(--color-ivory)]"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
