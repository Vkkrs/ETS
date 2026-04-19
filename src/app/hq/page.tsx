import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMondayOfCurrentWeek, getCalendarWeek, getTodayIndex } from "@/lib/utils/week";
import IntelSection from "@/components/hq/IntelSection";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ["JAN","FEB","MRZ","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DEZ"];
const DAYS_DE = ["SONNTAG","MONTAG","DIENSTAG","MITTWOCH","DONNERSTAG","FREITAG","SAMSTAG"];

function topbarDate(d: Date) {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${h}:${m}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HQPage() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekStart = getMondayOfCurrentWeek();
  const kw = getCalendarWeek(weekStart);
  const todayDayIndex = getTodayIndex();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [profileRes, workoutCountRes, exerciseCountRes, recipeCountRes, nutritionRes, planRes] =
    await Promise.all([
      user
        ? supabase.from("operator_profiles").select("*").eq("user_id", user.id).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id)
        : Promise.resolve({ count: 0 }),
      supabase.from("exercises").select("id", { count: "exact", head: true }),
      supabase.from("recipes").select("id", { count: "exact", head: true }),
      user
        ? supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("log_date", today).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("training_plans").select("*").eq("user_id", user.id).eq("week_start", weekStart).single()
        : Promise.resolve({ data: null }),
    ]);

  const profile = profileRes.data as Record<string, number> | null;
  const workoutCount = (workoutCountRes as { count?: number }).count ?? 0;
  const exerciseCount = (exerciseCountRes as { count?: number }).count ?? 0;
  const recipeCount = (recipeCountRes as { count?: number }).count ?? 0;
  const nutritionToday = nutritionRes.data as Record<string, number> | null;
  const plan = planRes.data as Record<string, string> | null;

  // ── Today's plan day ─────────────────────────────────────────────────────────
  let todayExerciseNames: string[] = [];
  let todayPlanType: string | null = null;
  let todayWorkoutName: string | null = null;

  if (plan?.id) {
    const { data: planDay } = await supabase
      .from("training_plan_days")
      .select("*")
      .eq("plan_id", plan.id)
      .eq("day_of_week", todayDayIndex)
      .single();

    if (planDay) {
      todayPlanType = planDay.type as string;
      todayWorkoutName = planDay.workout_name as string | null;
      const ids = (planDay.exercise_ids ?? []) as string[];
      if (planDay.type === "train" && ids.length > 0) {
        const { data: exData } = await supabase
          .from("exercises")
          .select("name")
          .in("id", ids);
        todayExerciseNames = (exData ?? []).map((e: { name: string }) => e.name);
      }
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────────
  const isEmpty = workoutCount === 0 && !plan;
  const hasTodayTraining = todayPlanType === "train" && todayExerciseNames.length > 0;

  const calorieTarget = (profile?.calorie_target as number) ?? 0;
  const proteinTarget = calorieTarget ? Math.round((calorieTarget * 0.3) / 4) : 0;
  const carbsTarget   = calorieTarget ? Math.round((calorieTarget * 0.4) / 4) : 0;
  const fatTarget     = calorieTarget ? Math.round((calorieTarget * 0.3) / 9) : 0;

  const timeToEvent = profile?.time_to_event_weeks as number | undefined;
  const daysMeta = timeToEvent
    ? `${timeToEvent} WOCHEN BIS SELEKTION`
    : workoutCount > 0
    ? `${workoutCount} WORKOUTS GELOGGT`
    : "NO LOGS ON RECORD";

  const heroTitle = isEmpty
    ? "OPERATOR\nFILE\nINITIALIZED"
    : (plan?.name ?? "BEREIT");

  const macros = [
    { label: "PROTEIN",  actual: (nutritionToday?.protein_g_actual  ?? 0) as number, target: proteinTarget, unit: "G" },
    { label: "CARBS",    actual: (nutritionToday?.carbs_g_actual     ?? 0) as number, target: carbsTarget,   unit: "G" },
    { label: "FAT",      actual: (nutritionToday?.fat_g_actual       ?? 0) as number, target: fatTarget,     unit: "G" },
    { label: "KALORIEN", actual: (nutritionToday?.calories_actual    ?? 0) as number, target: calorieTarget, unit: "KCAL" },
  ];

  return (
    <main className="pb-16">

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 1: Topbar                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="flex justify-between items-center px-[18px] relative"
        style={{ height: "44px" }}
      >
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1E1E1E 30%, #1E1E1E 70%, transparent)" }}
        />
        <div className="font-display text-[16px] tracking-[0.18em] text-ets-text-primary">
          E<span className="text-ets-accent">TS</span>
        </div>
        <div className="flex items-center gap-[12px] font-display text-[11px] tracking-[0.22em]">
          <span style={{ color: "#8A8A84" }}>{topbarDate(now)}</span>
          <span className="flex items-center gap-[6px] text-ets-accent">
            <span style={{ width: "5px", height: "5px", background: "#00FF88", boxShadow: "0 0 8px rgba(0,255,136,0.6)", display: "inline-block" }} />
            ONLINE
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 2: Hero — 380px                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="grain relative w-full overflow-hidden flex flex-col justify-end"
        style={{ height: "380px", padding: "0 22px 26px", isolation: "isolate" }}
      >
        <div className="absolute inset-0" style={{ background: "#050505" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.75) 100%)", zIndex: 1 }} />
        <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: "70%", background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.4) 60%, transparent 100%)", zIndex: 2 }} />
        <div className="relative" style={{ zIndex: 4 }}>
          <div className="font-display text-ets-accent mb-[14px]" style={{ fontSize: "12px", letterSpacing: "0.38em" }}>
            SITREP · {DAYS_DE[now.getDay()]} · KW {kw}
          </div>
          <h1 className="font-display text-ets-text-primary mb-[18px]" style={{ fontSize: "52px", lineHeight: 0.92, letterSpacing: "0.01em" }}>
            {heroTitle.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          <div style={{ width: "28px", height: "1px", background: "#00FF88", marginBottom: "10px" }} />
          <div className="font-body text-[11px] tracking-[0.18em] uppercase" style={{ color: "#8A8A84" }}>
            DAY {String(workoutCount).padStart(2, "0")}
            <span style={{ color: "#3A3A3A", margin: "0 8px" }}>·</span>
            <span style={{ color: "#C8C8C4" }}>{daysMeta}</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 3: Stat Grid                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2" style={{ borderTop: "1px solid #111111", borderLeft: "1px solid #111111" }}>
        {[
          { num: workoutCount,  label: "WORKOUTS"   },
          { num: exerciseCount, label: "ÜBUNGEN"    },
          { num: recipeCount,   label: "MAHLZEITEN" },
          { num: workoutCount,  label: "GELOGGT"    },
        ].map(({ num, label }) => (
          <div
            key={label}
            className="flex flex-col justify-between"
            style={{ padding: "22px 20px 18px", borderRight: "1px solid #111111", borderBottom: "1px solid #111111", minHeight: "110px" }}
          >
            <div className="font-display" style={{ fontSize: "46px", lineHeight: 1, color: isEmpty ? "#161616" : "#00FF88" }}>
              {num}
            </div>
            <div className="font-display" style={{ fontSize: "11px", letterSpacing: "0.28em", color: "#8A8A84", marginTop: "14px" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 4: Intel · Tagesbrief (Client Component)                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <IntelSection state={isEmpty ? "empty" : "filled"} />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 5: Heute                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-[22px] pt-[26px]" style={{ borderBottom: "1px solid #0C0C0C" }}>
        <div className="font-display text-[11px] tracking-[0.32em] mb-[14px]" style={{ color: "#8A8A84" }}>HEUTE</div>

        {hasTodayTraining ? (
          <>
            <div className="font-display mb-[10px]" style={{ fontSize: "22px", letterSpacing: "0.02em", color: "#FAFAF8", lineHeight: 1.1 }}>
              {todayWorkoutName ?? plan?.name ?? "TRAINING"}
            </div>
            <div className="font-body text-[11px] tracking-[0.16em] uppercase" style={{ color: "#8A8A84" }}>
              {todayExerciseNames.length} ÜBUNGEN
              <span style={{ color: "#3A3A3A", margin: "0 8px" }}>·</span>
              HIGH
            </div>
            <Link
              href="/log"
              className="flex items-center gap-[10px] font-display text-[13px]"
              style={{ letterSpacing: "0.2em", color: "#00FF88", borderTop: "1px solid #141414", marginTop: "14px", paddingTop: "14px", paddingBottom: "18px" }}
            >
              → EXECUTE
            </Link>
          </>
        ) : (
          <>
            <div className="font-display" style={{ fontSize: "38px", lineHeight: 0.95, color: "#0E0E0E", letterSpacing: "0.01em" }}>
              KEIN<br />PLAN
            </div>
            <Link
              href="/train/plan"
              className="flex items-center gap-[10px] font-display text-[13px]"
              style={{ letterSpacing: "0.2em", color: "#00FF88", borderTop: "1px solid #141414", marginTop: "14px", paddingTop: "14px", paddingBottom: "18px" }}
            >
              → WOCHENPLAN ERSTELLEN
            </Link>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 6: Chow · Tagesmakros                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-[22px] pt-[26px] pb-[4px]" style={{ borderBottom: "1px solid #0C0C0C" }}>
        <div className="font-display text-[11px] tracking-[0.32em] mb-[4px]" style={{ color: "#8A8A84" }}>
          CHOW · TAGESMAKROS
        </div>
        {macros.map(({ label, actual, target, unit }, idx) => {
          const hasTarget = target > 0;
          const pct = hasTarget ? Math.min(100, Math.round((actual / target) * 100)) : 0;
          const isFull = hasTarget && actual >= target;
          const noData = actual === 0;
          const isLast = idx === macros.length - 1;
          return (
            <div
              key={label}
              className="grid items-center"
              style={{
                gridTemplateColumns: "68px 1fr 78px",
                gap: "14px",
                padding: "10px 0",
                borderBottom: isLast ? "none" : "1px solid #0C0C0C",
              }}
            >
              <div className="font-display text-[12px] tracking-[0.22em]" style={{ color: noData ? "#6A6A66" : "#C8C8C4" }}>
                {label}
              </div>
              <div className="relative" style={{ height: "4px", background: "#0F0F0F", overflow: "hidden" }}>
                {!noData && (
                  <div className="absolute left-0 top-0 bottom-0" style={{ width: `${pct}%`, background: "#00FF88" }} />
                )}
              </div>
              <div
                className="font-body text-right"
                style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: noData ? "#6A6A66" : isFull ? "#00FF88" : "#FAFAF8", whiteSpace: "nowrap" }}
              >
                {actual}{" "}
                <span style={{ color: noData ? "#3A3A3A" : "#6A6A66", fontWeight: 400 }}>
                  / {hasTarget ? target : "—"}
                </span>{" "}
                {unit}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Block 7: CTA Block                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-[22px] pt-[26px] pb-[28px] flex flex-col gap-[10px]" style={{ borderBottom: "1px solid #0C0C0C" }}>
        {isEmpty ? (
          <>
            <Link
              href="/admin"
              className="w-full bg-ets-accent font-display text-[15px] tracking-[0.22em] text-black flex items-center justify-center min-h-[52px]"
            >
              + OPERATOR FILE ABSCHLIESSEN
            </Link>
            <Link
              href="/train/plan"
              className="w-full font-display text-[15px] tracking-[0.22em] text-ets-text-active flex items-center justify-center min-h-[52px]"
              style={{ border: "1px solid #242424" }}
            >
              WOCHENPLAN ERSTELLEN
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/log"
              className="w-full bg-ets-accent font-display text-[15px] tracking-[0.22em] text-black flex items-center justify-center min-h-[52px]"
            >
              + LOG WORKOUT
            </Link>
            <Link
              href="/log"
              className="w-full font-display text-[15px] tracking-[0.22em] text-ets-text-active flex items-center justify-center min-h-[52px]"
              style={{ border: "1px solid #242424" }}
            >
              DAILY LOG ÖFFNEN
            </Link>
          </>
        )}
      </div>

    </main>
  );
}
