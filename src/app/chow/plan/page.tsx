import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SecHero from "@/components/ui/SecHero";
import MealPlan from "@/components/chow/MealPlan";
import type { Recipe } from "@/types/database";

export default async function ChowPlanPage() {
  const supabase = await createClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, tags, calories_per_serving, protein_g, carbs_g, fat_g, servings")
    .order("name")
    .limit(200);

  return (
    <main className="pb-16">
      <SecHero eyebrow="WEEKLY" title="MEAL PLAN" />
      <div className="flex border-b border-ets-border">
        <Link
          href="/chow"
          className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-text-low hover:text-ets-text-primary transition-colors"
        >
          LIBRARY
        </Link>
        <span className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-accent border-b-2 border-ets-accent -mb-[1px]">
          PLAN
        </span>
      </div>
      <MealPlan allRecipes={(recipes as Recipe[]) ?? []} />
    </main>
  );
}
