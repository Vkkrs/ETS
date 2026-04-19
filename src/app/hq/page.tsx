import Link from "next/link";

export default function HQPage() {
  return (
    <main className="pb-16">
      <div className="px-4 pt-12">
        <p className="font-display text-xs tracking-widest text-ets-text-low mb-1">SITREP</p>
        <h1 className="font-display text-4xl tracking-wide text-ets-text-primary">HQ</h1>
        <p className="font-body text-sm text-ets-text-muted mt-4">
          Dashboard — coming soon.
        </p>
      </div>

      {/* DEV NAV — remove when auth flow is built */}
      <div className="mt-10 px-4 border-t border-ets-border pt-6">
        <p className="font-display text-[9px] tracking-[0.2em] text-ets-text-ghost mb-3">
          DEV
        </p>
        <div className="flex flex-col gap-[1px]">
          {[
            { href: "/train", label: "TRAIN" },
            { href: "/chow", label: "CHOW" },
            { href: "/log", label: "LOG" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-[14px] py-[12px] bg-ets-surface border border-ets-border font-display text-[12px] tracking-[0.14em] text-ets-text-low hover:text-ets-text-primary hover:border-ets-text-ghost transition-colors duration-100"
            >
              {label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6H10M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
