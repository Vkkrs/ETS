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

  const exList = (exercises as Exercise[]) ?? [];

  return (
    <main className="pb-16">
      <SecHero eyebrow="THE ARMORY" title={"EXERCISE\nDATABASE"} />
      <ExerciseList exercises={exList} />
      {/* Block 5: CTA Block */}
      <div className="px-[22px] pt-[26px] pb-[32px] flex flex-col gap-[10px]">
        <button className="w-full bg-ets-accent font-display text-[15px] tracking-[0.22em] text-black flex items-center justify-center min-h-[52px]">
          + ÜBUNG HINZUFÜGEN
        </button>
        {exList.length > 0 && (
          <button
            className="w-full font-display text-[15px] tracking-[0.22em] text-ets-text-active flex items-center justify-center min-h-[52px]"
            style={{ border: "1px solid #242424" }}
          >
            KI-ÜBUNG GENERIEREN
          </button>
        )}
      </div>
    </main>
  );
}
