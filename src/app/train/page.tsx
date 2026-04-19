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
      <ExerciseList exercises={(exercises as Exercise[]) ?? []} />
    </main>
  );
}
