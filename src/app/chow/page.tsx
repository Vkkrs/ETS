import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SecHero from "@/components/ui/SecHero";
import RecipeList from "@/components/chow/RecipeList";
import type { Recipe } from "@/types/database";

export default async function ChowPage() {
  const supabase = await createClient();

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Error fetching recipes:", error);
  }

  return (
    <main className="pb-16">
      <SecHero eyebrow="LIBRARY" title="CHOW" />
      <div className="flex border-b border-ets-border">
        <span className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-accent border-b-2 border-ets-accent -mb-[1px]">
          LIBRARY
        </span>
        <Link
          href="/chow/plan"
          className="flex-1 flex items-center justify-center py-[10px] font-display text-[10px] tracking-[0.12em] text-ets-text-low hover:text-ets-text-primary transition-colors"
        >
          PLAN
        </Link>
      </div>
      <RecipeList recipes={(recipes as Recipe[]) ?? []} />
    </main>
  );
}
