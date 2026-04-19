"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Recipe } from "@/types/database";
import { filterRecipes } from "@/lib/utils/filters";

type TagFilter = "all" | "pre_wo" | "post_wo" | "field_ready" | "bulk" | "cut";

const TAG_LABELS: Record<TagFilter, string> = {
  all: "ALLE",
  pre_wo: "PRE-WO",
  post_wo: "POST-WO",
  field_ready: "FIELD-READY",
  bulk: "BULK",
  cut: "CUT",
};

const TAG_SHORT: Record<string, string> = {
  pre_wo: "PRE",
  post_wo: "PST",
  field_ready: "FLD",
  bulk: "BLK",
  cut: "CUT",
};

interface RecipeListProps {
  recipes: Recipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<TagFilter>("all");

  const filtered = useMemo(
    () => filterRecipes(recipes, query, tag),
    [recipes, query, tag]
  );

  return (
    <div>
      {/* Search bar */}
      <div className="px-[22px] pt-[18px] pb-[14px] border-b border-ets-border">
        <div className="relative">
          <svg
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-ets-text-low"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH RECIPES"
            className="w-full bg-ets-surface border border-ets-border pl-[34px] pr-[12px] py-[9px] font-display text-[13px] tracking-[0.08em] text-ets-text-primary placeholder:text-ets-text-low focus:outline-none focus:border-ets-text-low"
          />
        </div>
      </div>

      {/* Tag filter — scrollable row */}
      <div className="flex border-b border-ets-border overflow-x-auto scrollbar-none">
        {(Object.keys(TAG_LABELS) as TagFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`flex-shrink-0 px-[14px] py-[10px] font-display text-[10px] tracking-[0.12em] whitespace-nowrap transition-colors duration-100 ${
              tag === t
                ? "text-ets-accent border-b-2 border-ets-accent -mb-[1px]"
                : "text-ets-text-low"
            }`}
          >
            {TAG_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="px-[22px] py-[10px] border-b border-ets-border">
        <span className="font-display text-[10px] tracking-[0.12em] text-ets-text-low">
          {filtered.length} REZEPTE
        </span>
      </div>

      {/* Recipe rows */}
      <div>
        {filtered.length === 0 ? (
          <div className="px-[22px] py-[40px] text-center">
            <p className="font-display text-[13px] tracking-widest text-ets-text-low">
              KEINE ERGEBNISSE
            </p>
          </div>
        ) : (
          filtered.map((recipe) => {
            const primaryTag = recipe.tags.find((t) => t !== "bulk" && t !== "cut") ?? recipe.tags[0];
            return (
              <Link
                key={recipe.id}
                href={`/chow/${recipe.id}`}
                className="grid grid-cols-[52px_1fr_auto_14px] gap-[14px] items-center px-[22px] py-[14px] border-b border-ets-border border-l-2 border-l-transparent hover:border-l-[rgba(0,255,136,0.3)] hover:bg-[#0A0A0A] transition-[border-color,background-color] duration-[120ms]"
              >
                {/* Tag badge */}
                <div className="flex items-center justify-center bg-ets-border h-[36px]">
                  <span className="font-display text-[10px] tracking-[0.1em] text-ets-text-low">
                    {TAG_SHORT[primaryTag] ?? "---"}
                  </span>
                </div>

                {/* Name + macros */}
                <div className="min-w-0">
                  <p className="font-display text-[15px] tracking-[0.03em] text-ets-text-primary leading-tight truncate">
                    {recipe.name}
                  </p>
                  <p className="font-body text-[11px] text-ets-text-low mt-[2px]">
                    {recipe.calories_per_serving}
                    <span className="text-ets-text-ghost"> kcal</span>
                    {recipe.protein_g != null && (
                      <> · {recipe.protein_g}<span className="text-ets-text-ghost">g P</span></>
                    )}
                    {recipe.prep_time != null && (
                      <> · {recipe.prep_time}<span className="text-ets-text-ghost">min</span></>
                    )}
                  </p>
                </div>

                {/* Tags pill row */}
                <div className="flex flex-col gap-[3px] items-end">
                  {recipe.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="font-display text-[8px] tracking-[0.08em] text-ets-text-ghost border border-ets-border px-[5px] py-[1px]"
                    >
                      {TAG_LABELS[t as TagFilter] ?? t.toUpperCase()}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ets-text-ghost">
                  <path d="M3 7H11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
