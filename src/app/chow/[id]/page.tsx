import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/types/database";

const TAG_LABELS: Record<string, string> = {
  pre_wo: "PRE-WO",
  post_wo: "POST-WO",
  field_ready: "FIELD-READY",
  bulk: "BULK",
  cut: "CUT",
};

interface Ingredient {
  item: string;
  amount: string;
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  const r = recipe as Recipe;
  const ingredients = r.ingredients as Ingredient[];

  return (
    <main className="pb-16">
      {/* Back bar */}
      <div className="flex items-center h-[52px] px-[22px] border-b border-ets-border bg-ets-bg sticky top-0 z-40">
        <Link
          href="/chow"
          className="flex items-center gap-[8px] text-ets-text-low hover:text-ets-text-primary transition-colors duration-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-[11px] tracking-[0.14em]">CHOW</span>
        </Link>
      </div>

      {/* Hero */}
      <div className="relative w-full overflow-hidden border-b border-[#141414] isolate">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ets-bg via-ets-bg/40 to-transparent" />
        <div className="relative z-10 px-[22px] pt-[32px] pb-[24px]">
          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mb-[14px]">
            {r.tags.map((t) => (
              <span
                key={t}
                className="font-display text-[10px] tracking-[0.14em] text-ets-text-low border border-ets-border px-[8px] py-[3px]"
              >
                {TAG_LABELS[t] ?? t.toUpperCase()}
              </span>
            ))}
          </div>
          <h1 className="font-display text-[36px] leading-[0.92] tracking-[0.01em] text-ets-text-primary mb-[10px]">
            {r.name}
          </h1>
          <p className="font-body text-[12px] text-ets-text-low">
            {r.prep_time != null && <>{r.prep_time} min · </>}
            {r.servings != null && <>{r.servings} {r.servings === 1 ? "Portion" : "Portionen"}</>}
          </p>
        </div>
      </div>

      {/* Macro strip */}
      <div className="flex border-b border-ets-border">
        {[
          { value: r.calories_per_serving, unit: "kcal", label: "KALORIEN" },
          { value: r.protein_g != null ? `${r.protein_g}g` : null, unit: "", label: "PROTEIN" },
          { value: r.carbs_g != null ? `${r.carbs_g}g` : null, unit: "", label: "CARBS" },
          { value: r.fat_g != null ? `${r.fat_g}g` : null, unit: "", label: "FAT" },
        ]
          .filter((m) => m.value != null)
          .map((macro, i, arr) => (
            <div
              key={macro.label}
              className={`flex-1 flex flex-col items-center py-[16px] ${i < arr.length - 1 ? "border-r border-ets-border" : ""}`}
            >
              <span className="font-display text-[20px] text-ets-text-primary leading-none">
                {macro.value}
              </span>
              <span className="font-display text-[9px] tracking-[0.16em] text-ets-text-low mt-[4px]">
                {macro.label}
              </span>
            </div>
          ))}
      </div>

      {/* Ingredients */}
      {ingredients && ingredients.length > 0 && (
        <div className="px-[22px] py-[18px] border-b border-ets-border">
          <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[14px]">
            ZUTATEN
          </p>
          <div className="space-y-[10px]">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-baseline justify-between gap-[12px]">
                <span className="font-body text-[13px] text-ets-text-muted">
                  {ing.item}
                </span>
                <span className="font-display text-[12px] tracking-[0.06em] text-ets-text-low whitespace-nowrap">
                  {ing.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {r.steps && r.steps.length > 0 && (
        <div className="px-[22px] py-[18px] border-b border-ets-border">
          <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[16px]">
            ZUBEREITUNG
          </p>
          <ol className="space-y-[14px]">
            {r.steps.map((step, i) => (
              <li key={i} className="flex gap-[14px]">
                <span className="font-display text-[13px] text-ets-accent leading-none pt-[1px] min-w-[16px]">
                  {i + 1}
                </span>
                <p className="font-body text-[13px] text-ets-text-muted leading-[1.55]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Storage notes */}
      {r.storage_notes && (
        <div className="px-[22px] py-[16px] border-b border-ets-border">
          <p className="font-display text-[10px] tracking-[0.2em] text-ets-text-low mb-[8px]">
            LAGERUNG
          </p>
          <p className="font-body text-[12px] text-ets-text-muted">
            {r.storage_notes}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="px-[22px] pt-[22px] pb-[8px]">
        <Link
          href="/log"
          className="flex items-center justify-center w-full bg-ets-accent h-[48px] font-display text-[13px] tracking-[0.18em] text-ets-bg hover:opacity-90 transition-opacity duration-100"
        >
          LOG MEAL
        </Link>
      </div>
    </main>
  );
}
