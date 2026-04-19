"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Exercise } from "@/types/database";
import { filterExercises } from "@/lib/utils/filters";

type Category = "all" | "calisthenics" | "strength" | "mobility";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "ALLE",
  calisthenics: "CALISTHENICS",
  strength: "KRAFT",
  mobility: "MOBILITY",
};

// calisthenics gets accent-tinted tag (.ltag.g), others get plain (.ltag)
const CATEGORY_TAG: Record<Exercise["category"], { label: string; accent: boolean }> = {
  calisthenics: { label: "CAL",  accent: true },
  strength:     { label: "STR",  accent: false },
  mobility:     { label: "MOB",  accent: false },
};

interface ExerciseListProps {
  exercises: Exercise[];
}

export default function ExerciseList({ exercises }: ExerciseListProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filtered = useMemo(
    () => filterExercises(exercises, query, category),
    [exercises, query, category]
  );

  return (
    <div>
      {/* Search bar — bottom-border only, no input box */}
      <div
        style={{
          margin: "14px 22px 6px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #0F0F0F",
          paddingBottom: "12px",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
            <circle cx="11" cy="11" r="8" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SUCHEN · MUSKEL · KATEGORIE..."
          style={{
            background: "none",
            border: "none",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "#666",
            outline: "none",
            flex: 1,
          }}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", borderBottom: "1px solid #0F0F0F" }}>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              flex: 1,
              padding: "9px 4px",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.14em",
              color: category === cat ? "#00FF88" : "#1A1A1A",
              background: "none",
              border: "none",
              borderBottom: category === cat ? "1px solid #00FF88" : "1px solid transparent",
              marginBottom: "-1px",
              cursor: "pointer",
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Exercise rows */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "0.2em", color: "#242424" }}>
              KEINE ERGEBNISSE
            </p>
          </div>
        ) : (
          filtered.map((ex) => {
            const tag = CATEGORY_TAG[ex.category];
            return (
              <Link
                key={ex.id}
                href={`/train/${ex.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 22px",
                  borderBottom: "1px solid #0C0C0C",
                  gap: "12px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {/* 44×44 thumbnail placeholder */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    flexShrink: 0,
                    background: "#0A0A0A",
                    overflow: "hidden",
                  }}
                />

                {/* Name + muscles */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "15px",
                      letterSpacing: "0.03em",
                      color: "#C8C8C8",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {ex.name}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      letterSpacing: "0.08em",
                      color: "#242424",
                      marginTop: "3px",
                    }}
                  >
                    {ex.muscle_primary.slice(0, 2).join(" · ").replace(/_/g, " ")}
                    {ex.sets_default ? ` · ${ex.sets_default}×${ex.reps_default ?? `${ex.duration_default}s`}` : ""}
                  </div>
                </div>

                {/* Category tag */}
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    padding: "3px 7px",
                    border: tag.accent ? "1px solid rgba(0,255,136,0.25)" : "1px solid #141414",
                    color: tag.accent ? "rgba(0,255,136,0.7)" : "#282828",
                    flexShrink: 0,
                  }}
                >
                  {tag.label}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
