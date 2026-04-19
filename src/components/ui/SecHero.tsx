interface SecHeroProps {
  eyebrow: string;
  title: string;
}

export default function SecHero({ eyebrow, title }: SecHeroProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "170px" }}>
      {/* Dark base */}
      <div className="absolute inset-0 bg-ets-bg" />

      {/* Grain — static, opacity 0.08, 180px tile */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      {/* Gradient — bottom to top */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, #080808 0%, transparent 100%)" }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: "14px 22px" }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.4em",
            color: "#00FF88",
            marginBottom: "6px",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "34px",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
            color: "#fff",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
