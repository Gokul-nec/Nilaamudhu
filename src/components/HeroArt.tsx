import Image from "next/image";

/**
 * Animated Hero Brand Seal:
 * Pure circular badge with prominent, clear Nilaamudhu logo.
 * The logo image width and height are scaled to h-[82%] w-[82%] with object-contain
 * so it is larger, bolder, and more prominent inside the circle without overflowing.
 */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 1. Pulsing ambient backglow */}
      <div
        className="animate-pulse-soft pointer-events-none absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-gradient-to-tr from-[var(--color-gold-500)]/20 to-[var(--color-forest-700)]/15 blur-3xl"
        aria-hidden
      />

      {/* 2. Floating container */}
      <div className="animate-float relative flex aspect-square w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] items-center justify-center">
        {/* 3. Slow rotating celestial dashed accent ring */}
        <div
          className="animate-spin-slow pointer-events-none absolute -inset-3.5 rounded-full border-2 border-dashed border-[var(--color-gold-500)]/45"
          aria-hidden
        />

        {/* 4. Secondary counter-rotating grain ring */}
        <div
          className="animate-spin-slow pointer-events-none absolute -inset-1.5 rounded-full border border-dotted border-[var(--color-forest-700)]/25"
          style={{ animationDirection: "reverse", animationDuration: "65s" }}
          aria-hidden
        />

        {/* 5. Pure Circular Emblem Badge Plate */}
        <div className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-line)] bg-gradient-to-b from-[var(--color-cream)] to-[var(--color-ivory)] shadow-[var(--shadow-lift)] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_22px_55px_rgba(43,29,20,0.18)]">
          {/* Subtle inner gold accent ring */}
          <div
            className="pointer-events-none absolute inset-2.5 rounded-full border border-[var(--color-gold-500)]/30"
            aria-hidden
          />

          {/* Logo container: adjusted width/height to 82% with object-contain for a prominent, centered display without overflowing */}
          <div className="relative flex h-[82%] w-[82%] items-center justify-center">
            <Image
              src="/logo-transparent.png"
              alt="Nilaamudhu Traditional Products"
              width={582}
              height={570}
              priority
              className="h-full w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
