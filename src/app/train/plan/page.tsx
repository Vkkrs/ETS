import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SecHero from "@/components/ui/SecHero";
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
      <SecHero eyebrow="WEEKLY" title="TRAINING PLAN" />
      <div className="flex border-b border-ets-border">
        <Link
          href="/train"
          className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-text-low hover:text-ets-text-primary transition-colors"
        >
          LIBRARY
        </Link>
        <span className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-accent border-b-2 border-ets-accent -mb-[1px]">
          PLAN
        </span>
      </div>
      <WeeklyPlan allExercises={(exercises as Exercise[]) ?? []} />
    </main>
  );
}
