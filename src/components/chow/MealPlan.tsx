"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMondayOfCurrentWeek, formatWeekRange, DAY_NAMES } from "@/lib/utils/week";
import type { MealPlan as MealPlanType, MealPlanEntry, Recipe } from "@/types/database";

type MealType = "breakfast" | "pre_wo" | "lunch" | "post_wo" | "dinner";

const MEAL_ORDER: MealType[] = ["breakfast", "pre_wo", "lunch", "post_wo", "dinner"];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "BREAKFAST",
  pre_wo: "PRE-WO",
  lunch: "LUNCH",
  post_wo: "POST-WO",
  dinner: "DINNER",
};

interface DayMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface EntryState {
  id: string | null;
  recipe_id: string | null;
  servings: number;
}

type WeekState = Record<number, Record<MealType, EntryState>>;

function emptyWeek(): WeekState {
  return Object.fromEntries(
    Array.from({ length: 7 }, (_, d) => [
      d,
      Object.fromEntries(MEAL_ORDER.map((m) => [m, { id: null, recipe_id: null, servings: 1 }])),
    ])
  ) as WeekState;
}

function calcDayMacros(dayEntries: Record<MealType, EntryState>, recipes: Recipe[]): DayMacros {
  let kcal = 0, protein = 0, carbs = 0, fat = 0;
  for (const entry of Object.values(dayEntries)) {
    if (!entry.recipe_id) continue;
    const recipe = recipes.find((r) => r.id === entry.recipe_id);
    if (!recipe) continue;
    const s = entry.servings;
    kcal += (recipe.calories_per_serving ?? 0) * s;
    protein += (recipe.protein_g ?? 0) * s;
    carbs += (recipe.carbs_g ?? 0) * s;
    fat += (recipe.fat_g ?? 0) * s;
  }
  return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat) };
}

export default function MealPlan({ allRecipes }: { allRecipes: Recipe[] }) {
  const supabase = createClient();
  const weekStart = getMondayOfCurrentWeek();

  const [plan, setPlan] = useState<MealPlanType | null>(null);
  const [week, setWeek] = useState<WeekState>(emptyWeek());
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [pickerKey, setPickerKey] = useState<{ day: number; meal: MealType } | null>(null);

  // ─── Load / create plan ───────────────────────────────────────────────────

  const loadPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; } // no user → show default UI, skip DB

    let { data: existing } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (!existing) {
      const { data: created } = await supabase
        .from("meal_plans")
        .insert({ user_id: user.id, week_start: weekStart })
        .select()
        .single();
      existing = created;
    }

    if (!existing) { setLoading(false); return; }
    setPlan(existing as MealPlanType);

    const { data: entries } = await supabase
      .from("meal_plan_entries")
      .select("*")
      .eq("plan_id", existing.id);

    if (entries && entries.length > 0) {
      const merged = emptyWeek();
      for (const entry of entries as MealPlanEntry[]) {
        const meal = entry.meal_type as MealType;
        if (MEAL_ORDER.includes(meal)) {
          merged[entry.day_of_week][meal] = {
            id: entry.id,
            recipe_id: entry.recipe_id,
            servings: entry.servings,
          };
        }
      }
      setWeek(merged);
    }
    setLoading(false);
  }, [supabase, weekStart]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ─── Save entry ───────────────────────────────────────────────────────────

  const assignRecipe = useCallback(async (dayIndex: number, meal: MealType, recipeId: string | null) => {
    if (!plan) return;
    const entry = week[dayIndex][meal];

    setWeek((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [meal]: { ...prev[dayIndex][meal], recipe_id: recipeId } },
    }));
    setPickerKey(null);

    if (entry.id) {
      if (recipeId === null) {
        await supabase.from("meal_plan_entries").delete().eq("id", entry.id);
        setWeek((prev) => ({
          ...prev,
          [dayIndex]: { ...prev[dayIndex], [meal]: { id: null, recipe_id: null, servings: 1 } },
        }));
      } else {
        await supabase.from("meal_plan_entries").update({ recipe_id: recipeId }).eq("id", entry.id);
      }
    } else if (recipeId !== null) {
      const { data } = await supabase
        .from("meal_plan_entries")
        .insert({ plan_id: plan.id, day_of_week: dayIndex, meal_type: meal, recipe_id: recipeId, servings: 1 })
        .select()
        .single();
      if (data) {
        setWeek((prev) => ({
          ...prev,
          [dayIndex]: { ...prev[dayIndex], [meal]: { ...prev[dayIndex][meal], id: data.id } },
        }));
      }
    }
  }, [plan, week, supabase]);

  // ─── Weekly totals ────────────────────────────────────────────────────────

  const weeklyTotals: DayMacros = Array.from({ length: 7 }, (_, i) => i)
    .map((d) => calcDayMacros(week[d], allRecipes))
    .reduce((acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

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
          Ø {weeklyTotals.kcal > 0 ? Math.round(weeklyTotals.kcal / 7) : "—"} kcal/Tag
        </span>
      </div>

      {/* 7 day accordion */}
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const isOpen = expandedDay === dayIndex;
        const dayMacros = calcDayMacros(week[dayIndex], allRecipes);
        const filledCount = MEAL_ORDER.filter((m) => week[dayIndex][m].recipe_id).length;

        return (
          <div key={dayIndex} className="border-b border-ets-border">
            {/* Day header — click to expand */}
            <button
              onClick={() => setExpandedDay(isOpen ? null : dayIndex)}
              className="w-full grid grid-cols-[36px_1fr_auto_20px] gap-[12px] items-center px-[22px] py-[14px] text-left"
            >
              <span className="font-display text-[13px] tracking-[0.08em] text-ets-text-low">
                {DAY_NAMES[dayIndex]}
              </span>

              {/* Macro summary */}
              {dayMacros.kcal > 0 ? (
                <div className="flex gap-[10px]">
                  <span className="font-display text-[11px] tracking-[0.04em] text-ets-text-muted">
                    {dayMacros.kcal}<span className="text-ets-text-ghost text-[9px]"> kcal</span>
                  </span>
                  <span className="font-display text-[11px] tracking-[0.04em] text-ets-text-low">
                    {dayMacros.protein}<span className="text-ets-text-ghost text-[9px]">g P</span>
                  </span>
                </div>
              ) : (
                <span className="font-body text-[11px] text-ets-text-ghost">
                  {filledCount === 0 ? "Keine Mahlzeiten" : `${filledCount} Mahlzeit${filledCount > 1 ? "en" : ""}`}
                </span>
              )}

              {/* Fill indicator dots */}
              <div className="flex gap-[3px]">
                {MEAL_ORDER.map((m) => (
                  <span
                    key={m}
                    className={`w-[4px] h-[4px] ${week[dayIndex][m].recipe_id ? "bg-ets-accent" : "bg-ets-border"}`}
                  />
                ))}
              </div>

              {/* Chevron */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ets-text-ghost flex-shrink-0">
                {isOpen
                  ? <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
            </button>

            {/* Expanded: meal slots */}
            {isOpen && (
              <div className="border-t border-ets-border bg-ets-surface">
                {MEAL_ORDER.map((meal) => {
                  const entry = week[dayIndex][meal];
                  const recipe = entry.recipe_id ? allRecipes.find((r) => r.id === entry.recipe_id) : null;
                  const isPickerOpen = pickerKey?.day === dayIndex && pickerKey?.meal === meal;

                  return (
                    <div key={meal} className="border-b border-ets-border last:border-b-0">
                      {/* Slot row */}
                      <div className="flex items-center gap-[12px] px-[22px] py-[10px]">
                        <span className="font-display text-[9px] tracking-[0.12em] text-ets-text-ghost w-[56px] flex-shrink-0">
                          {MEAL_LABELS[meal]}
                        </span>

                        {recipe ? (
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-[12px] tracking-[0.03em] text-ets-text-primary truncate">
                              {recipe.name}
                            </p>
                            <p className="font-body text-[10px] text-ets-text-ghost mt-[1px]">
                              {recipe.calories_per_serving} kcal · {recipe.protein_g}g P
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPickerKey(isPickerOpen ? null : { day: dayIndex, meal })}
                            className="flex-1 text-left font-body text-[11px] text-ets-text-ghost hover:text-ets-text-low transition-colors"
                          >
                            + Rezept wählen
                          </button>
                        )}

                        {recipe && (
                          <button
                            onClick={() => assignRecipe(dayIndex, meal, null)}
                            className="text-ets-text-ghost hover:text-ets-text-low transition-colors flex-shrink-0"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}

                        {!recipe && (
                          <button
                            onClick={() => setPickerKey(isPickerOpen ? null : { day: dayIndex, meal })}
                            className="text-ets-text-ghost flex-shrink-0"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              {isPickerOpen
                                ? <path d="M2 7L6 3L10 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                : <path d="M2 5L6 9L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              }
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Recipe picker dropdown */}
                      {isPickerOpen && (
                        <div className="border-t border-ets-border bg-ets-bg max-h-[200px] overflow-y-auto">
                          {allRecipes.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => assignRecipe(dayIndex, meal, r.id)}
                              className="w-full flex items-center justify-between px-[22px] py-[9px] border-b border-ets-border text-left hover:bg-[#0A0A0A] transition-colors"
                            >
                              <div>
                                <p className="font-display text-[12px] tracking-[0.03em] text-ets-text-muted">{r.name}</p>
                                <p className="font-body text-[10px] text-ets-text-ghost">
                                  {r.calories_per_serving} kcal · {r.protein_g}g P
                                </p>
                              </div>
                              <div className="flex gap-[4px] ml-[8px]">
                                {r.tags.slice(0, 1).map((t) => (
                                  <span key={t} className="font-display text-[8px] tracking-[0.06em] text-ets-text-ghost border border-ets-border px-[4px] py-[1px]">
                                    {t.toUpperCase().replace("_", "-")}
                                  </span>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Day macro summary */}
                {dayMacros.kcal > 0 && (
                  <div className="flex px-[22px] py-[12px] gap-[16px] bg-[#0A0A0A]">
                    {[
                      { val: dayMacros.kcal, unit: "kcal", label: "TOTAL" },
                      { val: dayMacros.protein, unit: "g", label: "PROTEIN" },
                      { val: dayMacros.carbs, unit: "g", label: "CARBS" },
                      { val: dayMacros.fat, unit: "g", label: "FAT" },
                    ].map(({ val, unit, label }) => (
                      <div key={label} className="flex flex-col">
                        <span className="font-display text-[14px] text-ets-text-primary leading-none">
                          {val}<span className="text-[9px] text-ets-text-ghost">{unit}</span>
                        </span>
                        <span className="font-display text-[8px] tracking-[0.12em] text-ets-text-ghost mt-[2px]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Weekly total */}
      {weeklyTotals.kcal > 0 && (
        <div className="px-[22px] py-[16px] border-b border-ets-border">
          <p className="font-display text-[9px] tracking-[0.18em] text-ets-text-ghost mb-[10px]">WOCHE GESAMT</p>
          <div className="flex gap-[20px]">
            {[
              { val: weeklyTotals.kcal, unit: "kcal", label: "KALORIEN" },
              { val: weeklyTotals.protein, unit: "g", label: "PROTEIN" },
              { val: weeklyTotals.carbs, unit: "g", label: "CARBS" },
              { val: weeklyTotals.fat, unit: "g", label: "FAT" },
            ].map(({ val, unit, label }) => (
              <div key={label} className="flex flex-col">
                <span className="font-display text-[18px] text-ets-text-primary leading-none">
                  {val}<span className="text-[10px] text-ets-text-ghost">{unit}</span>
                </span>
                <span className="font-display text-[8px] tracking-[0.12em] text-ets-accent mt-[3px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
