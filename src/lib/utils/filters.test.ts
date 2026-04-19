import { describe, it, expect } from "vitest";
import { filterExercises, filterRecipes } from "./filters";
import type { Exercise, Recipe } from "@/types/database";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeExercise = (overrides: Partial<Exercise>): Exercise => ({
  id: "1",
  user_id: null,
  name: "Pull-up",
  category: "calisthenics",
  muscle_primary: ["latissimus_dorsi", "biceps"],
  muscle_secondary: [],
  equipment: ["pull-up_bar"],
  difficulty: 3,
  intensity: "high",
  description: null,
  steps: null,
  sets_default: 4,
  reps_default: "6-10",
  duration_default: null,
  video_url: null,
  ai_generated: false,
  created_at: "2026-01-01",
  ...overrides,
});

const EXERCISES: Exercise[] = [
  makeExercise({ id: "1", name: "Pull-up", category: "calisthenics", muscle_primary: ["latissimus_dorsi"] }),
  makeExercise({ id: "2", name: "Deadlift", category: "strength", muscle_primary: ["hamstrings", "glutes"] }),
  makeExercise({ id: "3", name: "Hip 90/90 Stretch", category: "mobility", muscle_primary: ["hip_external_rotators"] }),
  makeExercise({ id: "4", name: "Push-up", category: "calisthenics", muscle_primary: ["pectoralis"] }),
];

const makeRecipe = (overrides: Partial<Recipe>): Recipe => ({
  id: "1",
  user_id: null,
  name: "Oat Power Bowl",
  tags: ["pre_wo", "bulk"],
  prep_time: 10,
  servings: 1,
  calories_per_serving: 520,
  protein_g: 28,
  carbs_g: 72,
  fat_g: 12,
  ingredients: [],
  steps: null,
  storage_notes: null,
  ai_generated: false,
  created_at: "2026-01-01",
  ...overrides,
});

const RECIPES: Recipe[] = [
  makeRecipe({ id: "1", name: "Oat Power Bowl", tags: ["pre_wo", "bulk"] }),
  makeRecipe({ id: "2", name: "Ground Beef & Rice", tags: ["post_wo", "bulk"] }),
  makeRecipe({ id: "3", name: "Ration Beef Jerky", tags: ["field_ready"] }),
  makeRecipe({ id: "4", name: "Chicken & Greens", tags: ["cut", "post_wo"] }),
];

// ─── filterExercises ─────────────────────────────────────────────────────────

describe("filterExercises", () => {
  it("returns all exercises when category=all and query is empty", () => {
    expect(filterExercises(EXERCISES, "", "all")).toHaveLength(4);
  });

  it("filters by category", () => {
    const result = filterExercises(EXERCISES, "", "calisthenics");
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === "calisthenics")).toBe(true);
  });

  it("filters by name query (case-insensitive)", () => {
    const result = filterExercises(EXERCISES, "pull", "all");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Pull-up");
  });

  it("filters by muscle_primary query", () => {
    const result = filterExercises(EXERCISES, "glutes", "all");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Deadlift");
  });

  it("combines category and query filters", () => {
    const result = filterExercises(EXERCISES, "push", "calisthenics");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Push-up");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterExercises(EXERCISES, "xxxxxxxx", "all")).toHaveLength(0);
  });

  it("returns empty array when category has no matches", () => {
    expect(filterExercises(EXERCISES, "deadlift", "calisthenics")).toHaveLength(0);
  });

  it("handles whitespace-only query as empty", () => {
    expect(filterExercises(EXERCISES, "   ", "all")).toHaveLength(4);
  });

  it("handles empty exercise list", () => {
    expect(filterExercises([], "pull", "all")).toHaveLength(0);
  });
});

// ─── filterRecipes ────────────────────────────────────────────────────────────

describe("filterRecipes", () => {
  it("returns all recipes when tag=all and query is empty", () => {
    expect(filterRecipes(RECIPES, "", "all")).toHaveLength(4);
  });

  it("filters by single tag", () => {
    const result = filterRecipes(RECIPES, "", "field_ready");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ration Beef Jerky");
  });

  it("matches recipes with multiple tags when filtering by one", () => {
    const result = filterRecipes(RECIPES, "", "bulk");
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toContain("Oat Power Bowl");
    expect(result.map((r) => r.name)).toContain("Ground Beef & Rice");
  });

  it("filters by name query (case-insensitive)", () => {
    const result = filterRecipes(RECIPES, "chicken", "all");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Chicken & Greens");
  });

  it("combines tag and query filters", () => {
    const result = filterRecipes(RECIPES, "beef", "post_wo");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ground Beef & Rice");
  });

  it("returns empty array when nothing matches", () => {
    expect(filterRecipes(RECIPES, "xxxxxxxx", "all")).toHaveLength(0);
  });

  it("returns empty array when tag has no matches for query", () => {
    expect(filterRecipes(RECIPES, "chicken", "field_ready")).toHaveLength(0);
  });

  it("handles whitespace-only query as empty", () => {
    expect(filterRecipes(RECIPES, "   ", "all")).toHaveLength(4);
  });

  it("handles empty recipe list", () => {
    expect(filterRecipes([], "oat", "all")).toHaveLength(0);
  });
});
