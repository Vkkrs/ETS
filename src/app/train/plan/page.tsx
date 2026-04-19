import { createClient } from "@/lib/supabase/server";
import WeeklyPlan from "@/components/train/WeeklyPlan";
import type { Exercise } from "@/types/database";

export default async function TrainPlanPage() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, category, sets_default, reps_default, duration_default, muscle_primary, difficulty")
    .order("category")
    .order("name")
    .limit(200);

  return (
    <main className="pb-16">
      <WeeklyPlan allExercises={(exercises as Exercise[]) ?? []} />
    </main>
  );
}
