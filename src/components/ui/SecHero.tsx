interface SecHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SecHero({ eyebrow, title, subtitle }: SecHeroProps) {
  return (
    <div className="relative w-full h-[200px] overflow-hidden flex flex-col justify-end border-b border-[#141414] isolate">
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
      {/* Fade gradient from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-ets-bg via-ets-bg/60 to-transparent" />
      <div className="relative z-10 px-[22px] pb-[22px]">
        <p className="font-display text-[12px] tracking-[0.38em] text-ets-accent mb-[10px]">
          {eyebrow}
        </p>
        <h1 className="font-display text-[34px] leading-[0.94] tracking-[0.01em] text-ets-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-[13px] text-ets-text-muted mt-[8px]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
