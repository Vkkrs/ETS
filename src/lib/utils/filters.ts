import type { Exercise, Recipe } from "@/types/database";

export type ExerciseCategory = "all" | "calisthenics" | "strength" | "mobility";
export type RecipeTag = "all" | "pre_wo" | "post_wo" | "field_ready" | "bulk" | "cut";

export function filterExercises(
  exercises: Exercise[],
  query: string,
  category: ExerciseCategory
): Exercise[] {
  const q = query.trim().toLowerCase();
  return exercises.filter((ex) => {
    const matchesCategory = category === "all" || ex.category === category;
    const matchesQuery =
      q === "" ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscle_primary.some((m) => m.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });
}

export function filterRecipes(
  recipes: Recipe[],
  query: string,
  tag: RecipeTag
): Recipe[] {
  const q = query.trim().toLowerCase();
  return recipes.filter((r) => {
    const matchesTag = tag === "all" || r.tags.includes(tag);
    const matchesQuery = q === "" || r.name.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });
}
