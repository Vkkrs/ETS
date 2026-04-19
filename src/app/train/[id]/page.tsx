import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/types/database";

const INTENSITY_LABEL: Record<string, string> = {
  low: "LOW",
  moderate: "MODERATE",
  high: "HIGH",
  maximal: "MAXIMAL",
};

const CATEGORY_LABEL: Record<string, string> = {
  calisthenics: "CALISTHENICS",
  strength: "STRENGTH",
  mobility: "MOBILITY",
};

const DIFFICULTY_DOTS = [1, 2, 3, 4, 5];

function formatMuscle(s: string) {
  return s.replace(/_/g, " ").toUpperCase();
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exercise, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !exercise) {
    notFound();
  }

  const ex = exercise as Exercise;

  return (
    <main className="pb-16">
      {/* Back bar */}
      <div className="flex items-center h-[52px] px-[22px] border-b border-ets-border bg-ets-bg sticky top-0 z-40">
        <Link
          href="/train"
          className="flex items-center gap-[8px] text-ets-text-low hover:text-ets-text-primary transition-colors duration-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-[11px] tracking-[0.14em]">TRAIN</span>
        </Link>
      </div>

      {/* Hero — 200px, grain 0.08, vignette + gradient */}
      <div className="relative w-full overflow-hidden" style={{ height: "200px", borderBottom: "1px solid #141414" }}>
        <div className="absolute inset-0 bg-ets-bg" />
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.08,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.65) 100%)" }}
        />
        {/* Gradient bottom */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.5) 50%, transparent 100%)" }}
        />
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0" style={{ padding: "22px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: "#00FF88", marginBottom: "6px" }}>
            {CATEGORY_LABEL[ex.category]} · {INTENSITY_LABEL[ex.intensity]}
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", lineHeight: 0.86, letterSpacing: "0.01em", color: "#fff" }}>
            {ex.name}
          </h1>
          <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "10px" }}>
            {[1,2,3,4,5].map((d) => (
              <span
                key={d}
                style={{ width: "6px", height: "6px", background: d <= ex.difficulty ? "#00FF88" : "#141414", display: "inline-block" }}
              />
            ))}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "9px", letterSpacing: "0.14em", color: "#383838", marginLeft: "6px" }}>
              LEVEL {ex.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {ex.description && (
        <div className="px-[22px] py-[18px] border-b border-ets-border">
          <p className="font-body text-[13px] text-ets-text-muted leading-[1.6]">
            {ex.description}
          </p>
        </div>
      )}

      {/* Sets / Reps / Duration strip */}
      <div className="flex border-b border-ets-border">
        {ex.sets_default && (
          <div className="flex-1 flex flex-col items-center py-[16px] border-r border-ets-border">
            <span className="font-display text-[24px] text-ets-text-primary leading-none">
              {ex.sets_default}
            </span>
            <span className="font-display text-[9px] tracking-[0.16em] text-ets-text-low mt-[4px]">
              SETS
            </span>
          </div>
        )}
        {ex.reps_default && (
          <div className="flex-1 flex flex-col items-center py-[16px] border-r border-ets-border last:border-r-0">
            <span className="font-display text-[24px] text-ets-text-primary leading-none">
              {ex.reps_default}
            </span>
            <span className="font-display text-[9px] tracking-[0.16em] text-ets-text-low mt-[4px]">
              REPS
            </span>
          </div>
        )}
        {ex.duration_default && (
          <div className="flex-1 flex flex-col items-center py-[16px]">
            <span className="font-display text-[24px] text-ets-text-primary leading-none">
              {ex.duration_default}
              <span className="text-[14px] text-ets-text-low">s</span>
            </span>
            <span className="font-display text-[9px] tracking-[0.16em] text-ets-text-low mt-[4px]">
              HOLD
            </span>
          </div>
        )}
      </div>

      {/* Muscles */}
      <div className="px-[22px] py-[18px] border-b border-ets-border">
        <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[12px]">
          MUSKELN
        </p>
        <div className="flex flex-wrap gap-[6px] mb-[8px]">
          {ex.muscle_primary.map((m) => (
            <span
              key={m}
              className="font-display text-[10px] tracking-[0.08em] text-ets-text-primary bg-ets-surface border border-ets-border px-[8px] py-[4px]"
            >
              {formatMuscle(m)}
            </span>
          ))}
        </div>
        {ex.muscle_secondary.length > 0 && (
          <div className="flex flex-wrap gap-[6px]">
            {ex.muscle_secondary.map((m) => (
              <span
                key={m}
                className="font-display text-[10px] tracking-[0.08em] text-ets-text-low border border-ets-border px-[8px] py-[4px]"
              >
                {formatMuscle(m)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Equipment */}
      {ex.equipment.length > 0 && (
        <div className="px-[22px] py-[18px] border-b border-ets-border">
          <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[12px]">
            EQUIPMENT
          </p>
          <div className="flex flex-wrap gap-[6px]">
            {ex.equipment.map((eq) => (
              <span
                key={eq}
                className="font-display text-[10px] tracking-[0.08em] text-ets-text-muted border border-ets-border px-[8px] py-[4px]"
              >
                {eq.replace(/_/g, " ").toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {ex.steps && ex.steps.length > 0 && (
        <div className="px-[22px] py-[18px] border-b border-ets-border">
          <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[16px]">
            AUSFÜHRUNG
          </p>
          <ol className="space-y-[14px]">
            {ex.steps.map((step, i) => (
              <li key={i} className="flex gap-[14px]">
                <span className="font-display text-[13px] text-ets-accent leading-none pt-[1px] min-w-[16px]">
                  {i + 1}
                </span>
                <p className="font-body text-[13px] text-ets-text-muted leading-[1.55]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* CTA */}
      <div className="px-[22px] pt-[22px] pb-[8px]">
        <Link
          href="/log"
          className="flex items-center justify-center w-full bg-ets-accent h-[48px] font-display text-[13px] tracking-[0.18em] text-ets-bg hover:opacity-90 transition-opacity duration-100"
        >
          EXECUTE
        </Link>
      </div>
    </main>
  );
}
