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
      {/* Block 1: Back bar */}
      <Link
        href="/train"
        className="flex items-center gap-[10px] px-[22px] pt-[20px] pb-[14px] relative z-20"
      >
        <span className="font-display text-[20px] text-ets-accent leading-none">←</span>
        <span className="font-display text-[11px] tracking-[0.32em] text-ets-accent">ZURÜCK · ARMORY</span>
      </Link>

      {/* Block 2: Hero — 360px, slides under back bar via -mt-[58px] */}
      <div
        className="grain relative w-full overflow-hidden flex flex-col justify-end"
        style={{ height: "360px", marginTop: "-58px", padding: "0 22px 26px", isolation: "isolate" }}
      >
        {/* Dark base */}
        <div className="absolute inset-0" style={{ background: "#050505" }} />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.78) 100%)", zIndex: 1 }}
        />
        {/* Fade bottom */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{ height: "72%", background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.4) 60%, transparent 100%)", zIndex: 2 }}
        />
        {/* Content */}
        <div className="relative" style={{ zIndex: 4 }}>
          <div className="font-display text-[12px] tracking-[0.4em] text-ets-accent mb-[14px]">
            {CATEGORY_LABEL[ex.category]} · LOAD BEARING
          </div>
          <h1 className="font-display text-ets-text-primary mb-[16px]" style={{ fontSize: "48px", lineHeight: 0.92, letterSpacing: "0.01em" }}>
            {ex.name}
          </h1>
          <div className="mb-[10px]" style={{ width: "28px", height: "1px", background: "#00FF88" }} />
          <div className="font-body text-[11px] tracking-[0.18em] text-ets-text-mid uppercase">
            {ex.muscle_primary.slice(0, 2).map(formatMuscle).join(" · ")}
          </div>
        </div>
      </div>

      {/* Block 3: Plan Strip */}
      <div className="grid grid-cols-3 border-t border-b border-ets-border">
        <div className="flex flex-col gap-[8px] px-[20px] py-[18px] border-r border-ets-border">
          <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">INTENSITÄT</span>
          <span className="font-display text-[16px] tracking-[0.04em] text-ets-accent">
            {INTENSITY_LABEL[ex.intensity]}
          </span>
        </div>
        <div className="flex flex-col gap-[8px] px-[20px] py-[18px] border-r border-ets-border">
          <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">EQUIPMENT</span>
          <span className="font-display text-[16px] tracking-[0.04em] text-ets-text-primary">
            {ex.equipment.length > 0 ? ex.equipment[0].replace(/_/g, " ").toUpperCase() : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-[8px] px-[20px] py-[18px]">
          <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">SCHWIERIGKEIT</span>
          <div className="flex items-center gap-[4px] mt-[2px]">
            {DIFFICULTY_DOTS.map((d) => (
              <div
                key={d}
                style={{ width: "8px", height: "8px", background: d <= ex.difficulty ? "#00FF88" : "#1E1E1E" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Block 4: Beschreibung */}
      {ex.description && (
        <div className="px-[22px] py-[26px] border-b" style={{ borderColor: "#0C0C0C" }}>
          <div className="font-display text-[11px] tracking-[0.32em] text-ets-text-low mb-[14px]">BESCHREIBUNG</div>
          <p className="font-body text-[14px] text-ets-text-muted leading-[1.6]" style={{ letterSpacing: "0.005em" }}>
            {ex.description}
          </p>
        </div>
      )}

      {/* Block 5: Muskulatur */}
      <div className="px-[22px] py-[26px] border-b" style={{ borderColor: "#0C0C0C" }}>
        <div className="font-display text-[11px] tracking-[0.32em] text-ets-text-low mb-[14px]">MUSKULATUR</div>
        <div className="flex flex-wrap gap-[8px]">
          {ex.muscle_primary.map((m) => (
            <span
              key={m}
              className="font-display text-[11px] tracking-[0.22em] px-[10px] py-[6px]"
              style={{ border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", background: "rgba(0,255,136,0.04)" }}
            >
              {formatMuscle(m)}
            </span>
          ))}
          {ex.muscle_secondary.map((m) => (
            <span
              key={m}
              className="font-display text-[11px] tracking-[0.22em] px-[10px] py-[6px]"
              style={{ border: "1px solid #242424", color: "#C8C8C4" }}
            >
              {formatMuscle(m)}
            </span>
          ))}
        </div>
      </div>

      {/* Block 6: Ausführung */}
      {ex.steps && ex.steps.length > 0 && (
        <div className="px-[22px] py-[26px] border-b" style={{ borderColor: "#0C0C0C" }}>
          <div className="font-display text-[11px] tracking-[0.32em] text-ets-text-low mb-[14px]">AUSFÜHRUNG</div>
          <div className="flex flex-col">
            {(ex.steps as string[]).map((step, i) => (
              <div
                key={i}
                className="grid gap-[14px]"
                style={{
                  gridTemplateColumns: "28px 1fr",
                  borderBottom: i < ex.steps!.length - 1 ? "1px solid #0C0C0C" : "none",
                  paddingBottom: i < ex.steps!.length - 1 ? "14px" : "0",
                  marginBottom: i < ex.steps!.length - 1 ? "14px" : "0",
                }}
              >
                <span className="font-display text-[16px] tracking-[0.04em] text-ets-accent" style={{ lineHeight: 1.3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-body text-[13px] text-ets-text-muted leading-[1.55]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block 7: Sets · Reps · Pause */}
      <div className="px-[22px] py-[26px] border-b" style={{ borderColor: "#0C0C0C" }}>
        <div className="font-display text-[11px] tracking-[0.32em] text-ets-text-low mb-[14px]">SETS · REPS · PAUSE</div>
        <div className="grid grid-cols-3 border border-ets-border">
          <div className="flex flex-col gap-[6px] px-[14px] py-[16px] border-r border-ets-border">
            <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">SETS</span>
            <span className="font-display text-[22px] tracking-[0.02em] text-ets-accent leading-none">
              {ex.sets_default ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-[6px] px-[14px] py-[16px] border-r border-ets-border">
            <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">REPS</span>
            <span className="font-display text-[22px] tracking-[0.02em] text-ets-text-primary leading-none">
              {ex.reps_default ?? "—"}
            </span>
          </div>
          <div className="flex flex-col gap-[6px] px-[14px] py-[16px]">
            <span className="font-body font-medium text-[10px] tracking-[0.18em] text-ets-text-low uppercase">PAUSE</span>
            <span className="font-display text-[22px] tracking-[0.02em] text-ets-text-primary leading-none">
              {ex.duration_default ? (
                <>{ex.duration_default}<span className="text-[12px] text-ets-text-low ml-[4px] tracking-[0.18em]">SEK</span></>
              ) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Block 8: Intel · Coach */}
      <div className="px-[22px] py-[26px] border-b" style={{ borderColor: "#0C0C0C" }}>
        <div className="font-display text-[11px] tracking-[0.32em] text-ets-text-low mb-[14px]">INTEL · COACH</div>
        <div
          className="font-body text-[13px] leading-[1.55] text-ets-text-muted pl-[14px] py-[4px]"
          style={{ borderLeft: "2px solid rgba(0,255,136,0.3)" }}
        >
          <span className="text-ets-text-primary font-medium">
            Gewicht wählen, das die letzten 2 Reps grenzwertig sind.
          </span>{" "}
          Wenn {ex.reps_default ?? "alle Wdh."} ohne Formverlust möglich, Last erhöhen — nicht mehr Reps.
        </div>
      </div>

      {/* Block 9: CTA Block */}
      <div className="px-[22px] pt-[22px] pb-[28px] border-t flex flex-col gap-[10px]" style={{ borderColor: "#0C0C0C" }}>
        <button className="w-full bg-ets-accent font-display text-[15px] tracking-[0.22em] text-black flex items-center justify-center min-h-[52px]">
          ZUM PLAN HINZUFÜGEN
        </button>
        <Link
          href="/log"
          className="w-full font-display text-[15px] tracking-[0.22em] text-ets-text-active flex items-center justify-center min-h-[52px]"
          style={{ border: "1px solid #242424" }}
        >
          IN LOG AUFNEHMEN
        </Link>
      </div>
    </main>
  );
}
