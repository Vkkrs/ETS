"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Exercise } from "@/types/database";

type Category = "all" | "calisthenics" | "strength" | "mobility";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "ALLE",
  calisthenics: "CALISTHENICS",
  strength: "KRAFT",
  mobility: "MOBILITY",
};

const DIFFICULTY_DOTS = [1, 2, 3, 4, 5];

const CATEGORY_TAG: Record<Exercise["category"], string> = {
  calisthenics: "CAL",
  strength: "STR",
  mobility: "MOB",
};

interface ExerciseListProps {
  exercises: Exercise[];
}

export default function ExerciseList({ exercises }: ExerciseListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesCategory = category === "all" || ex.category === category;
      const matchesQuery =
        query.trim() === "" ||
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.muscle_primary.some((m) =>
          m.toLowerCase().includes(query.toLowerCase())
        );
      return matchesCategory && matchesQuery;
    });
  }, [exercises, query, category]);

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
            placeholder="SEARCH EXERCISES"
            className="w-full bg-ets-surface border border-ets-border pl-[34px] pr-[12px] py-[9px] font-display text-[13px] tracking-[0.08em] text-ets-text-primary placeholder:text-ets-text-low focus:outline-none focus:border-ets-text-low"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex border-b border-ets-border">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 py-[10px] font-display text-[10px] tracking-[0.12em] transition-colors duration-100 ${
              category === cat
                ? "text-ets-accent border-b-2 border-ets-accent -mb-[1px]"
                : "text-ets-text-low"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="px-[22px] py-[10px] border-b border-ets-border">
        <span className="font-display text-[10px] tracking-[0.12em] text-ets-text-low">
          {filtered.length} ÜBUNGEN
        </span>
      </div>

      {/* Exercise rows */}
      <div>
        {filtered.length === 0 ? (
          <div className="px-[22px] py-[40px] text-center">
            <p className="font-display text-[13px] tracking-widest text-ets-text-low">
              KEINE ERGEBNISSE
            </p>
          </div>
        ) : (
          filtered.map((ex) => (
            <Link
              key={ex.id}
              href={`/train/${ex.id}`}
              className="grid grid-cols-[52px_1fr_auto_14px] gap-[14px] items-center px-[22px] py-[14px] border-b border-ets-border border-l-2 border-l-transparent hover:border-l-[rgba(0,255,136,0.3)] hover:bg-[#0A0A0A] transition-[border-color,background-color] duration-[120ms]"
            >
              {/* Category tag */}
              <div className="flex items-center justify-center bg-ets-border h-[36px]">
                <span className="font-display text-[10px] tracking-[0.1em] text-ets-text-low">
                  {CATEGORY_TAG[ex.category]}
                </span>
              </div>

              {/* Name + muscles */}
              <div className="min-w-0">
                <p className="font-display text-[15px] tracking-[0.03em] text-ets-text-primary leading-tight truncate">
                  {ex.name}
                </p>
                <p className="font-body text-[11px] text-ets-text-low mt-[2px] truncate">
                  {ex.muscle_primary.slice(0, 2).join(" · ").replace(/_/g, " ")}
                </p>
              </div>

              {/* Difficulty dots */}
              <div className="flex gap-[3px] items-center">
                {DIFFICULTY_DOTS.map((d) => (
                  <span
                    key={d}
                    className={`w-[5px] h-[5px] rounded-full ${
                      d <= ex.difficulty ? "bg-ets-accent" : "bg-ets-border"
                    }`}
                  />
                ))}
              </div>

              {/* Arrow */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-ets-text-ghost"
              >
                <path
                  d="M3 7H11M7 3L11 7L7 11"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
