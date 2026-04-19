"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMondayOfCurrentWeek, formatWeekRange, DAY_NAMES } from "@/lib/utils/week";
import type { Exercise, TrainingPlan, TrainingPlanDay } from "@/types/database";

type DayType = "train" | "rest" | "recovery";

const DAY_TYPE_CYCLE: DayType[] = ["train", "rest", "recovery"];

const DAY_BADGE: Record<DayType, { label: string; style: React.CSSProperties }> = {
  train: {
    label: "TRAIN",
    style: {
      background: "rgba(0,255,136,0.07)",
      color: "rgba(0,255,136,0.5)",
      border: "1px solid rgba(0,255,136,0.18)",
      fontSize: "9px",
      letterSpacing: "0.14em",
      padding: "4px 8px",
      fontFamily: "'Bebas Neue', sans-serif",
    },
  },
  rest: {
    label: "REST",
    style: {
      background: "#0A0A0A",
      color: "#1E1E1E",
      border: "1px solid #101010",
      fontSize: "9px",
      letterSpacing: "0.14em",
      padding: "4px 8px",
      fontFamily: "'Bebas Neue', sans-serif",
    },
  },
  recovery: {
    label: "RECOVERY OP",
    style: {
      background: "#0A0A0A",
      color: "#1E1E1E",
      border: "1px solid #101010",
      fontSize: "9px",
      letterSpacing: "0.14em",
      padding: "4px 8px",
      fontFamily: "'Bebas Neue', sans-serif",
    },
  },
};

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

export default function WeeklyPlan({ allExercises }: { allExercises: Exercise[] }) {
  const supabase = createClient();
  const weekStart = getMondayOfCurrentWeek();

  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [days, setDays] = useState<DayState[]>(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  // ─── Load or create plan ─────────────────────────────────────────────────

  const loadPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; } // no user → show default UI, skip DB

    let { data: existing } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (!existing) {
      const { data: created } = await supabase
        .from("training_plans")
        .insert({ user_id: user.id, name: `Week ${weekStart}`, week_start: weekStart })
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
      if (dbDay) return { id: dbDay.id, type: dbDay.type, workout_name: dbDay.workout_name, exercise_ids: dbDay.exercise_ids ?? [] };
      return def;
    });
    setDays(merged);
    setLoading(false);
  }, [supabase, weekStart]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ─── Save day to DB ───────────────────────────────────────────────────────

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
      if (data) {
        setDays((prev) => prev.map((d, i) => i === index ? { ...d, id: data.id } : d));
      }
    }
    setSaving(null);
  }, [plan, supabase]);

  // ─── Toggle day type ──────────────────────────────────────────────────────

  const toggleDayType = (index: number) => {
    setDays((prev) => {
      const current = prev[index];
      const nextType = DAY_TYPE_CYCLE[(DAY_TYPE_CYCLE.indexOf(current.type) + 1) % 3];
      const updated = { ...current, type: nextType, exercise_ids: nextType !== "train" ? [] : current.exercise_ids };
      saveDay(index, updated);
      return prev.map((d, i) => i === index ? updated : d);
    });
  };

  // ─── Toggle exercise on a day ─────────────────────────────────────────────

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

  const exerciseById = (id: string) => allExercises.find((e) => e.id === id);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="px-[22px] py-[40px] text-center">
        <p className="font-display text-[11px] tracking-widest text-ets-text-low">STAND BY</p>
      </div>
    );
  }

  return (
    <div>
      {/* Week header */}
      <div className="flex items-center justify-between px-[22px] py-[12px] border-b border-ets-border">
        <span className="font-display text-[10px] tracking-[0.16em] text-ets-text-low">
          {formatWeekRange(weekStart)}
        </span>
        <span className="font-display text-[9px] tracking-[0.1em] text-ets-text-ghost">
          {days.filter((d) => d.type === "train").length}× TRAIN
        </span>
      </div>

      {/* 7 day rows */}
      {days.map((day, index) => {
        const badge = DAY_BADGE[day.type];
        const dayExercises = day.exercise_ids.map(exerciseById).filter(Boolean) as Exercise[];
        const isPickerOpen = pickerDayIndex === index;

        return (
          <div key={index} className="border-b border-ets-border">
            {/* Day row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "13px 22px",
                borderBottom: isPickerOpen || (!isPickerOpen && day.type === "train" && dayExercises.length > 0) ? undefined : undefined,
              }}
            >
              {/* Left: day name + exercises */}
              <div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "19px",
                    letterSpacing: "0.03em",
                    color: day.type === "train" ? "#DADADA" : "#555",
                  }}
                >
                  {DAY_NAMES[index]}
                </div>
                {day.type === "train" && dayExercises.length > 0 && !isPickerOpen && (
                  <div
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.05em",
                      color: "#1E1E1E",
                      marginTop: "3px",
                      maxWidth: "215px",
                      lineHeight: 1.5,
                    }}
                  >
                    {dayExercises.map((e) => e.name).join(" · ")}
                  </div>
                )}
              </div>

              {/* Right: badge + expand button */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={() => toggleDayType(index)}
                  style={{ ...badge.style, opacity: saving === index ? 0.5 : 1 }}
                >
                  {badge.label}
                </button>

                {day.type === "train" && (
                  <button
                    onClick={() => setPickerDayIndex(isPickerOpen ? null : index)}
                    style={{ color: "#383838", display: "flex", alignItems: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      {isPickerOpen
                        ? <path d="M2 9L7 4L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      }
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Expanded: exercise picker */}
            {isPickerOpen && day.type === "train" && (
              <div className="border-t border-ets-border bg-ets-surface">
                <div className="px-[22px] py-[10px] border-b border-ets-border">
                  <p className="font-display text-[9px] tracking-[0.2em] text-ets-text-ghost">ÜBUNGEN WÄHLEN</p>
                </div>
                <div className="max-h-[240px] overflow-y-auto">
                  {allExercises.map((ex) => {
                    const selected = day.exercise_ids.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => toggleExercise(index, ex.id)}
                        className={`w-full flex items-center justify-between px-[22px] py-[10px] border-b border-ets-border text-left transition-colors duration-100 ${
                          selected ? "bg-[#0A0A0A]" : "hover:bg-[#0A0A0A]"
                        }`}
                      >
                        <div>
                          <p className={`font-display text-[13px] tracking-[0.03em] ${selected ? "text-ets-accent" : "text-ets-text-muted"}`}>
                            {ex.name}
                          </p>
                          <p className="font-body text-[10px] text-ets-text-ghost mt-[1px]">
                            {ex.category.toUpperCase()} · {ex.sets_default ? `${ex.sets_default}×` : ""}{ex.reps_default ?? `${ex.duration_default}s`}
                          </p>
                        </div>
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ets-accent flex-shrink-0">
                            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
  );
}
