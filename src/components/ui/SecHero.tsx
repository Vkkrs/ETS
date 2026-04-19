interface SecHeroProps {
  eyebrow: string;
  title: string;
  meta?: string;
  height?: number;
  ghost?: boolean;
}

export default function SecHero({ eyebrow, title, meta, height = 200, ghost = false }: SecHeroProps) {
  const titleLines = title.split("\n");

  return (
    <div
      className="grain relative w-full overflow-hidden flex flex-col justify-end"
      style={{ height: `${height}px`, padding: "0 22px 20px", isolation: "isolate", borderBottom: "1px solid #141414" }}
    >
      {/* Dark base */}
      <div className="absolute inset-0" style={{ background: "#050505" }} />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 80% at 50% 30%, transparent 35%, rgba(0,0,0,0.75) 100%)", zIndex: 1 }}
      />

      {/* Fade bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{ height: "75%", background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.4) 60%, transparent 100%)", zIndex: 2 }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 4 }}>
        <div
          className="font-display text-ets-accent mb-[10px]"
          style={{ fontSize: "12px", letterSpacing: "0.38em" }}
        >
          {eyebrow}
        </div>
        <div
          className="font-display"
          style={{ fontSize: "34px", lineHeight: 0.94, letterSpacing: "0.01em", color: ghost ? "#1E1E1E" : "#FAFAF8" }}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </div>
        {meta && (
          <div
            className="font-body mt-[10px] uppercase"
            style={{ fontSize: "11px", letterSpacing: "0.16em", color: ghost ? "#3A3A3A" : "#C8C8C4" }}
          >
            {meta}
          </div>
        )}
      </div>
    </div>
  );
}
