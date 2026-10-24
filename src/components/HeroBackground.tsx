/**
 * HeroBackground:
 * Decorative agriculture-themed background for the hero section.
 * - Golden-hour sun glow (soft radial pulse behind brand emblem)
 * - Layered swaying paddy field silhouettes (forest green & gold)
 * - Drifting rice grains (hidden on mobile < 640px)
 * - Faint traditional Tamil kolam watermark behind copy
 * - Field-row SVG bottom transition divider
 */
export function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Golden-Hour Sun Glow behind the logo badge */}
      <div
        className="animate-pulse-soft pointer-events-none absolute -top-16 -right-16 md:right-10 lg:right-24 h-[420px] w-[420px] sm:h-[560px] sm:w-[560px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(circle, var(--color-gold-500) 0%, var(--color-gold-300) 40%, transparent 70%)",
        }}
      />

      {/* 2. Soft ambient forest light on the left */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 h-[480px] w-[480px] rounded-full bg-[var(--color-forest-100)] opacity-25 blur-3xl"
      />

      {/* 3. Traditional Tamil Kolam Watermark behind the left copy */}
      <div className="pointer-events-none absolute -top-6 -left-6 sm:left-4 md:left-10 h-72 w-72 sm:h-96 sm:w-96 text-[var(--color-gold-700)] opacity-[0.04]">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          className="h-full w-full"
        >
          {/* Traditional 8-fold lotus paddy kolam geometry */}
          <circle cx="100" cy="100" r="88" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="64" />
          <circle cx="100" cy="100" r="38" />
          <circle cx="100" cy="100" r="14" />
          {/* Diagonal interwoven petals */}
          <path d="M100 12 C120 50, 150 80, 188 100 C150 120, 120 150, 100 188 C80 150, 50 120, 12 100 C50 80, 80 50, 100 12 Z" />
          <path d="M162 38 C140 75, 125 125, 162 162 C125 140, 75 140, 38 162 C60 125, 75 75, 38 38 C75 60, 125 60, 162 38 Z" />
          {/* Paddy grain dot points */}
          <circle cx="100" cy="40" r="3" fill="currentColor" />
          <circle cx="100" cy="160" r="3" fill="currentColor" />
          <circle cx="40" cy="100" r="3" fill="currentColor" />
          <circle cx="160" cy="100" r="3" fill="currentColor" />
          <circle cx="58" cy="58" r="3" fill="currentColor" />
          <circle cx="142" cy="58" r="3" fill="currentColor" />
          <circle cx="58" cy="142" r="3" fill="currentColor" />
          <circle cx="142" cy="142" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* 4. Floating Rice Grains (hidden on < 640px) */}
      <div className="hidden sm:block pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "14%", top: "12%", cls: "animate-drift-1", delay: "0s", scale: 0.95 },
          { left: "26%", top: "20%", cls: "animate-drift-2", delay: "2.4s", scale: 0.85 },
          { left: "38%", top: "8%", cls: "animate-drift-3", delay: "4.8s", scale: 1 },
          { left: "62%", top: "16%", cls: "animate-drift-1", delay: "1.6s", scale: 0.9 },
          { left: "74%", top: "24%", cls: "animate-drift-2", delay: "5.5s", scale: 1.05 },
          { left: "86%", top: "10%", cls: "animate-drift-3", delay: "3.2s", scale: 0.8 },
          { left: "48%", top: "28%", cls: "animate-drift-1", delay: "7.0s", scale: 0.9 },
          { left: "82%", top: "34%", cls: "animate-drift-2", delay: "6.2s", scale: 0.95 },
        ].map((g, i) => (
          <div
            key={i}
            className={`absolute ${g.cls}`}
            style={{
              left: g.left,
              top: g.top,
              animationDelay: g.delay,
              transform: `scale(${g.scale})`,
            }}
          >
            <svg
              width="8"
              height="16"
              viewBox="0 0 8 16"
              fill="none"
              className="text-[var(--color-gold-500)] drop-shadow-[0_1px_2px_rgba(200,135,27,0.25)]"
            >
              <ellipse cx="4" cy="8" rx="3" ry="7" fill="currentColor" />
              <path
                d="M4 2V14"
                stroke="var(--color-gold-700)"
                strokeWidth="0.6"
                strokeOpacity="0.45"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* 5. Layered Paddy Field Silhouettes at the bottom */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 sm:h-44 overflow-hidden">
        {/* Layer 1 (Back, forest-700, 11s sway) */}
        <div className="animate-sway-1 absolute bottom-0 -left-[6%] w-[112%] h-28 sm:h-36 text-[var(--color-forest-700)] opacity-14">
          <svg
            viewBox="0 0 1440 160"
            fill="none"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M0,70 C240,25 480,95 720,40 C960,-10 1200,65 1440,30 L1440,160 L0,160 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Layer 2 (Middle, gold-500, 9s sway) */}
        <div className="animate-sway-2 absolute bottom-0 -left-[5%] w-[110%] h-24 sm:h-30 text-[var(--color-gold-500)] opacity-12">
          <svg
            viewBox="0 0 1440 140"
            fill="none"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M0,50 C320,85 580,20 860,65 C1140,110 1320,35 1440,55 L1440,140 L0,140 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Layer 3 (Front, forest-900, 12s sway) */}
        <div className="animate-sway-3 absolute bottom-0 -left-[4%] w-[108%] h-16 sm:h-24 text-[var(--color-forest-900)] opacity-16">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M0,45 C280,15 620,60 940,30 C1180,5 1340,40 1440,25 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* 6. Organic Field-Row bottom border divider to anchor into next section */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-6 text-[var(--color-cream)]">
        <svg
          viewBox="0 0 1440 24"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0,12 Q360,24 720,12 T1440,12 L1440,24 L0,24 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
