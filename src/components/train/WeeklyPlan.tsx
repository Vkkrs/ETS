"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SecHero from "@/components/ui/SecHero";
import {
  getMondayOfCurrentWeek,
  getCalendarWeek,
  getTodayIndex,
  DAY_NAMES_FULL,
} from "@/lib/utils/week";
import type { Exercise, TrainingPlan, TrainingPlanDay } from "@/types/database";

type DayType = "train" | "rest" | "recovery";

const DAY_TYPE_CYCLE: DayType[] = ["train", "rest", "recovery"];

interface DayState {
  id: string | null;
  type: DayType;
  workout_name: string | null;
  exercise_ids: string[];
}

const DEFAULT_DAYS: DayState[] = Array.from({ length: 7 }, (_, i) => ({
  id: null,
  type: i < 5 ? "train" : "rest",
  workout_name: null,
  exercise_ids: [],
}));

const BADGE_STYLES: Record<DayType | "empty", React.CSSProperties> = {
  train: {
    background: "rgba(0,255,136,0.07)",
    color: "#00FF88",
    border: "1px solid rgba(0,255,136,0.25)",
  },
  rest: {
    background: "#0A0A0A",
    color: "#8A8A84",
    border: "1px solid #242424",
  },
  recovery: {
    background: "#0A0A0A",
    color: "#8A8A84",
    border: "1px solid #242424",
  },
  empty: {
    background: "#0A0A0A",
    color: "#3A3A3A",
    border: "1px solid #141414",
  },
};

const BADGE_LABELS: Record<DayType, string> = {
  train: "TRAIN",
  rest: "REST",
  recovery: "RECOVERY",
};

export default function WeeklyPlan({ allExercises }: { allExercises: Exercise[] }) {
  const supabase = createClient();
  const weekStart = getMondayOfCurrentWeek();
  const kw = getCalendarWeek(weekStart);
  const todayIndex = getTodayIndex();

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [days, setDays] = useState<DayState[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const exerciseById = (id: string) => allExercises.find((e) => e.id === id);

  // ─── Load or create plan ─────────────────────────────────────────────────

  const loadPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let { data: existing } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (!existing) {
      const { data: created } = await supabase
        .from("training_plans")
        .insert({ user_id: user.id, name: `KW ${kw}`, week_start: weekStart })
        .select()
        .single();
      existing = created;
    }

    if (!existing) { setLoading(false); return; }
    setPlan(existing as TrainingPlan);

    const { data: planDays } = await supabase
      .from("training_plan_days")
      .select("*")
      .eq("plan_id", existing.id)
      .order("day_of_week");

    const merged: DayState[] = DEFAULT_DAYS.map((def, i) => {
      const dbDay = (planDays ?? []).find((d: TrainingPlanDay) => d.day_of_week === i);
      if (dbDay) return {
        id: dbDay.id,
        type: dbDay.type as DayType,
        workout_name: dbDay.workout_name,
        exercise_ids: dbDay.exercise_ids ?? [],
      };
      return def;
    });
    setDays(merged);
    setLoading(false);
  }, [supabase, weekStart, kw]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ─── Save day ────────────────────────────────────────────────────────────

  const saveDay = useCallback(async (index: number, updated: DayState) => {
    if (!plan) return;
    setSaving(index);
    if (updated.id) {
      await supabase.from("training_plan_days").update({
        type: updated.type,
        workout_name: updated.workout_name,
        exercise_ids: updated.exercise_ids,
      }).eq("id", updated.id);
    } else {
      const { data } = await supabase.from("training_plan_days").insert({
        plan_id: plan.id,
        day_of_week: index,
        type: updated.type,
        workout_name: updated.workout_name,
        exercise_ids: updated.exercise_ids,
      }).select().single();
      if (data) setDays((prev) => prev.map((d, i) => i === index ? { ...d, id: data.id } : d));
    }
    setSaving(null);
  }, [plan, supabase]);

  const toggleDayType = (index: number) => {
    setDays((prev) => {
      const current = prev[index];
      const nextType = DAY_TYPE_CYCLE[(DAY_TYPE_CYCLE.indexOf(current.type) + 1) % 3];
      const updated = { ...current, type: nextType, exercise_ids: nextType !== "train" ? [] : current.exercise_ids };
      saveDay(index, updated);
      return prev.map((d, i) => i === index ? updated : d);
    });
  };

  const toggleExercise = (dayIndex: number, exerciseId: string) => {
    setDays((prev) => {
      const current = prev[dayIndex];
      const ids = current.exercise_ids.includes(exerciseId)
        ? current.exercise_ids.filter((id) => id !== exerciseId)
        : [...current.exercise_ids, exerciseId];
      const updated = { ...current, exercise_ids: ids };
      saveDay(dayIndex, updated);
      return prev.map((d, i) => i === dayIndex ? updated : d);
    });
  };

  // ─── Derived state ───────────────────────────────────────────────────────

  const trainDays = days.filter((d) => d.type === "train");
  const restDays = days.filter((d) => d.type !== "train");
  const isEmpty = !days.some((d) => d.type === "train" && d.exercise_ids.length > 0);

  const planTitle = plan?.name ?? `KW ${kw}`;
  const planMeta = isEmpty
    ? `7 TAGE · 0 SESSIONS`
    : `${trainDays.length} SESSIONS · ${restDays.length} RECOVERY · KW ${kw}`;

  // ─── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        {/* Block 1: SecHero — loading ghost */}
        <SecHero
          eyebrow={`OP-ORDER · KW ${kw}`}
          title="STAND BY"
          ghost
          height={220}
        />
        {/* Block 2: Plan Strip — ghost */}
        <PlanStrip ghost />
        {/* Block 3: Day Rows — ghost */}
        <div>
          {DAY_NAMES_FULL.map((name, i) => (
            <DayRow key={i} name={name.toUpperCase()} type="rest" exercises={[]} isEmpty today={false} saving={false} onToggleType={() => {}} onOpenPicker={() => {}} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Block 1: SecHero */}
      <SecHero
        eyebrow={`OP-ORDER · KW ${kw}`}
        title={planTitle}
        meta={planMeta}
        ghost={isEmpty}
        height={220}
      />

      {/* Block 2: Plan Strip */}
      <PlanStrip
        ghost={isEmpty}
        intensity={plan?.intensity?.toUpperCase()}
        equipment={plan?.equipment?.toUpperCase()}
      />

      {/* Block 3: Day Rows */}
      <div>
        {days.map((day, index) => {
          const dayExercises = day.exercise_ids.map(exerciseById).filter(Boolean) as Exercise[];
          const isToday = index === todayIndex;
          const isPickerOpen = pickerDayIndex === index;

          return (
            <div key={index}>
              <DayRow
                name={DAY_NAMES_FULL[index].toUpperCase()}
                type={day.type}
                exercises={dayExercises}
                isEmpty={isEmpty}
                today={isToday}
                saving={saving === index}
                onToggleType={() => toggleDayType(index)}
                onOpenPicker={() => setPickerDayIndex(isPickerOpen ? null : index)}
                pickerOpen={isPickerOpen}
              />

              {/* Exercise picker — inline below row */}
              {isPickerOpen && day.type === "train" && (
                <div style={{ background: "#0F0F0F", borderBottom: "1px solid #0C0C0C" }}>
                  <div className="px-[22px] py-[10px] border-b" style={{ borderColor: "#0C0C0C" }}>
                    <span className="font-display text-[9px] tracking-[0.2em]" style={{ color: "#282828" }}>
                      ÜBUNGEN WÄHLEN
                    </span>
                  </div>
                  <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                    {allExercises.map((ex) => {
                      const selected = day.exercise_ids.includes(ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => toggleExercise(index, ex.id)}
                          className="w-full flex items-center justify-between text-left"
                          style={{
                            padding: "10px 22px",
                            borderBottom: "1px solid #0A0A0A",
                            background: selected ? "#0A0A0A" : "transparent",
                          }}
                        >
                          <div>
                            <div className="font-display text-[13px] tracking-[0.03em]" style={{ color: selected ? "#00FF88" : "#B8B4A8" }}>
                              {ex.name}
                            </div>
                            <div className="font-body text-[10px] mt-[1px]" style={{ color: "#282828" }}>
                              {ex.category.toUpperCase()} · {ex.sets_default ? `${ex.sets_default}×` : ""}{ex.reps_default ?? `${ex.duration_default}s`}
                            </div>
                          </div>
                          {selected && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#00FF88" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Block 4a: Empty State */}
      {isEmpty && (
        <div className="px-[22px]" style={{ paddingTop: "40px", paddingBottom: "26px", borderBottom: "1px solid #0C0C0C" }}>
          <div className="font-display text-[11px] tracking-[0.35em] mb-[16px]" style={{ color: "#8A8A84" }}>OP-ORDER OFFEN</div>
          <div className="font-display mb-[12px]" style={{ fontSize: "44px", lineHeight: 0.95, color: "#1E1E1E", letterSpacing: "0.01em" }}>
            KEIN<br />PLAN<br />AKTIV
          </div>
          <div className="font-body text-[13px] leading-[1.55] mb-[6px]" style={{ color: "#8A8A84", maxWidth: "280px" }}>
            Generiere einen 7-Tage-Plan über den KI-Generator oder erstelle einen manuell aus deiner Armory.
          </div>
          <div style={{ borderTop: "1px solid #141414", paddingTop: "8px", marginTop: "16px" }}>
            <button
              className="flex items-center gap-[10px] font-display text-[13px] w-full text-left"
              style={{ letterSpacing: "0.2em", color: "#00FF88", padding: "14px 0", borderTop: "none", borderRight: "none", borderLeft: "none", borderBottom: "1px solid #0C0C0C", minHeight: "44px", background: "none" }}
            >
              → KI-PLAN GENERIEREN
            </button>
            <button
              className="flex items-center gap-[10px] font-display text-[13px] w-full text-left"
              style={{ letterSpacing: "0.2em", color: "#8A8A84", padding: "14px 0", minHeight: "44px", background: "none", border: "none" }}
            >
              → MANUELL ERSTELLEN
            </button>
          </div>
        </div>
      )}

      {/* Block 4b: Intel · Coach */}
      {!isEmpty && (
        <div className="px-[22px] py-[24px] border-b" style={{ borderColor: "#0C0C0C" }}>
          <div className="font-display text-[11px] tracking-[0.32em] mb-[14px]" style={{ color: "#8A8A84" }}>INTEL · COACH</div>
          <div
            className="font-body text-[13px] leading-[1.55] pl-[14px] py-[4px]"
            style={{ borderLeft: "2px solid rgba(0,255,136,0.3)", color: "#B8B4A8" }}
          >
            <span style={{ color: "#FAFAF8", fontWeight: 500 }}>
              {DAY_NAMES_FULL[todayIndex].toUpperCase()} ist dein Anchor-Day.
            </span>{" "}
            Wenn du diesen Tag auslässt, verschiebt sich die Woche um einen Rest-Tag — plan entsprechend.
          </div>
        </div>
      )}

      {/* Block 5: CTA Block */}
      {!isEmpty && (
        <div className="px-[22px] pt-[22px] pb-[28px] flex flex-col gap-[10px]">
          <button className="w-full bg-ets-accent font-display text-[15px] tracking-[0.22em] text-black flex items-center justify-center min-h-[52px]">
            KI-PLAN GENERIEREN
          </button>
          <button
            className="w-full font-display text-[15px] tracking-[0.22em] text-ets-text-active flex items-center justify-center min-h-[52px]"
            style={{ border: "1px solid #242424" }}
          >
            PLAN DUPLIZIEREN
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanStrip({ ghost, intensity, equipment }: { ghost: boolean; intensity?: string; equipment?: string }) {
  const ghostColor = "#3A3A3A";
  return (
    <div className="grid grid-cols-3 border-b" style={{ borderColor: "#111111" }}>
      <div className="flex flex-col gap-[6px] px-[18px] py-[18px] border-r" style={{ borderColor: "#111111" }}>
        <span className="font-body font-medium text-[10px] tracking-[0.18em] uppercase" style={{ color: "#8A8A84" }}>INTENSITÄT</span>
        <span className="font-display text-[16px] tracking-[0.04em]" style={{ color: ghost ? ghostColor : "#00FF88" }}>
          {ghost ? "—" : (intensity ?? "—")}
        </span>
      </div>
      <div className="flex flex-col gap-[6px] px-[18px] py-[18px] border-r" style={{ borderColor: "#111111" }}>
        <span className="font-body font-medium text-[10px] tracking-[0.18em] uppercase" style={{ color: "#8A8A84" }}>ZEIT / TAG</span>
        <span className="font-display text-[16px] tracking-[0.04em]" style={{ color: ghost ? ghostColor : "#FAFAF8" }}>—</span>
      </div>
      <div className="flex flex-col gap-[6px] px-[18px] py-[18px]">
        <span className="font-body font-medium text-[10px] tracking-[0.18em] uppercase" style={{ color: "#8A8A84" }}>EQUIPMENT</span>
        <span className="font-display text-[16px] tracking-[0.04em]" style={{ color: ghost ? ghostColor : "#FAFAF8" }}>
          {ghost ? "—" : (equipment ?? "—")}
        </span>
      </div>
    </div>
  );
}

interface DayRowProps {
  name: string;
  type: DayType;
  exercises: Exercise[];
  isEmpty: boolean;
  today: boolean;
  saving: boolean;
  onToggleType: () => void;
  onOpenPicker?: () => void;
  pickerOpen?: boolean;
}

function DayRow({ name, type, exercises, isEmpty, today, saving, onToggleType, onOpenPicker, pickerOpen }: DayRowProps) {
  const nameColor = isEmpty ? "#3A3A3A" : type === "train" ? "#D8D4C8" : "#6A6A66";
  const badgeStyle = isEmpty ? BADGE_STYLES.empty : BADGE_STYLES[type];
  const badgeLabel = isEmpty ? "—" : BADGE_LABELS[type];

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "92px 1fr auto",
    gap: "12px",
    alignItems: "center",
    padding: "16px 22px",
    borderBottom: "1px solid #0C0C0C",
    borderLeft: today ? "2px solid #00FF88" : "2px solid transparent",
    background: today ? "#0A0A0A" : "transparent",
    cursor: "pointer",
    transition: "border-left-color 0.12s, background 0.12s",
  };

  const contentText = type === "train" && exercises.length > 0
    ? exercises.map((e) => e.name).join(" · ")
    : type === "rest"
    ? "Mobility · Foam Roll 20 min"
    : type === "recovery"
    ? "Recovery Op · Zone 2 Walk 45 min"
    : "—";

  return (
    <div
      style={rowStyle}
      onMouseEnter={(e) => { if (!today) { e.currentTarget.style.borderLeftColor = "rgba(0,255,136,0.3)"; e.currentTarget.style.background = "#0A0A0A"; } }}
      onMouseLeave={(e) => { if (!today) { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent"; } }}
      onClick={type === "train" ? onOpenPicker : onToggleType}
    >
      {/* Day name */}
      <div className="font-display text-[19px] tracking-[0.04em]" style={{ color: nameColor }}>
        {name}
      </div>

      {/* Content */}
      <div
        className="font-body text-[11px] leading-[1.5]"
        style={{
          color: isEmpty ? "#1E1E1E" : type === "rest" || type === "recovery" ? "#3A3A3A" : "#8A8A84",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {contentText}
      </div>

      {/* Badge */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleType(); }}
        className="font-display text-[10px] tracking-[0.22em] px-[9px]"
        style={{ ...badgeStyle, paddingTop: "5px", paddingBottom: "5px", opacity: saving ? 0.5 : 1 }}
      >
        {badgeLabel}
      </button>
    </div>
  );
}
