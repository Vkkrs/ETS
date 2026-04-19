import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SecHero from "@/components/ui/SecHero";
import ExerciseList from "@/components/train/ExerciseList";
import type { Exercise } from "@/types/database";

export default async function TrainPage() {
  const supabase = await createClient();

  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Error fetching exercises:", error);
  }

  return (
    <main className="pb-16">
      <SecHero eyebrow="LIBRARY" title="TRAIN" />
      <div className="flex border-b border-ets-border">
        <span className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-accent border-b-2 border-ets-accent -mb-[1px]">
          LIBRARY
        </span>
        <Link
          href="/train/plan"
          className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-text-low hover:text-ets-text-primary transition-colors"
        >
          PLAN
        </Link>
      </div>
      <ExerciseList exercises={(exercises as Exercise[]) ?? []} />
    </main>
  );
}
