"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Exercise } from "@/types/database";
import { filterExercises, type ExerciseCategory as Category } from "@/lib/utils/filters";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "ALLE",
  calisthenics: "CALISTHENICS",
  strength: "KRAFT",
  mobility: "MOBILITY",
};

function getTag(ex: Exercise): { label: string; variant: "plain" | "accent" | "ki" } {
  if (ex.ai_generated) return { label: "KI", variant: "ki" };
  if (ex.category === "calisthenics") return { label: "CAL", variant: "accent" };
  if (ex.category === "strength") return { label: "STR", variant: "plain" };
  return { label: "MOB", variant: "plain" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

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

  const counts = useMemo(() => ({
    all: exercises.length,
    calisthenics: exercises.filter((e) => e.category === "calisthenics").length,
    strength: exercises.filter((e) => e.category === "strength").length,
    mobility: exercises.filter((e) => e.category === "mobility").length,
  }), [exercises]);

  return (
    <div>
      {/* Block 2: Search Bar */}
      <div
        className="flex items-center gap-[12px] px-[22px]"
        style={{ padding: "18px 22px 14px", borderBottom: "1px solid #0F0F0F" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ stroke: "#6A6A66", strokeWidth: 1.6 }}>
          <circle cx="11" cy="11" r="7" />
          <path d="M16 16 L21 21" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SUCHEN · MUSKEL · TAG..."
          className="flex-1 bg-transparent font-display text-[13px] text-ets-text-mid outline-none"
          style={{ letterSpacing: "0.18em" }}
        />
        <span className="font-display text-[10px] tracking-[0.28em]" style={{ color: "#6A6A66" }}>
          {filtered.length}
        </span>
      </div>

      {/* Block 3: Category Filter */}
      <div
        className="flex overflow-x-auto"
        style={{ gap: "22px", padding: "14px 22px 0", borderBottom: "1px solid #0F0F0F", scrollbarWidth: "none" }}
      >
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="font-display flex-shrink-0 cursor-pointer"
              style={{
                fontSize: "11px",
                letterSpacing: "0.28em",
                color: active ? "#00FF88" : "#6A6A66",
                paddingBottom: "14px",
                paddingTop: "10px",
                borderTop: "none",
                borderRight: "none",
                borderLeft: "none",
                borderBottom: active ? "2px solid #00FF88" : "2px solid transparent",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
                background: "none",
              }}
            >
              {CATEGORY_LABELS[cat]}{" "}
              <span style={{ color: active ? "rgba(0,255,136,0.5)" : "#3A3A3A", fontSize: "10px" }}>
                {counts[cat]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Block 4a/4b: List or Empty State */}
      {filtered.length === 0 ? (
        /* Block 4b: Empty State */
        <div className="px-[22px]" style={{ paddingTop: "40px", paddingBottom: "40px", borderBottom: "1px solid #0C0C0C" }}>
          <div className="font-display text-[11px] tracking-[0.35em] mb-[16px]" style={{ color: "#8A8A84" }}>
            {exercises.length === 0 ? "ARMORY LEER" : "KEINE ERGEBNISSE"}
          </div>
          <div className="font-display mb-[12px]" style={{ fontSize: "48px", lineHeight: 0.94, color: "#1E1E1E", letterSpacing: "0.01em" }}>
            {exercises.length === 0 ? "KEINE\nÜBUNGEN".split("\n").map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>) : "KEIN\nERGEBNIS".split("\n").map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}
          </div>
          <div className="font-body text-[13px] leading-[1.55] mb-[24px]" style={{ color: "#8A8A84", maxWidth: "280px" }}>
            {exercises.length === 0
              ? "Deine Armory ist leer. Generiere Übungen über den KI-Generator oder lege Einträge manuell an."
              : "Keine Übungen für diese Suche gefunden."}
          </div>
          {exercises.length === 0 && (
            <div style={{ borderTop: "1px solid #141414", paddingTop: "18px" }}>
              <button
                className="flex items-center gap-[10px] font-display text-[13px] w-full text-left"
                style={{ letterSpacing: "0.2em", color: "#00FF88", padding: "12px 0", borderTop: "none", borderRight: "none", borderLeft: "none", borderBottom: "1px solid #0C0C0C", minHeight: "44px", background: "none" }}
              >
                <span>→</span> KI-GENERIERUNG STARTEN
              </button>
              <button
                className="flex items-center gap-[10px] font-display text-[13px] w-full text-left"
                style={{ letterSpacing: "0.2em", color: "#8A8A84", padding: "12px 0", minHeight: "44px", background: "none", border: "none" }}
              >
                <span>→</span> MANUELL HINZUFÜGEN
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Block 4a: List Rows */
        <div>
          {filtered.map((ex) => {
            const tag = getTag(ex);
            const initials = getInitials(ex.name);
            return (
              <Link
                key={ex.id}
                href={`/train/${ex.id}`}
                className="flex items-center border-left-2 border-transparent hover-accent"
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr auto 14px",
                  gap: "14px",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderBottom: "1px solid #0C0C0C",
                  textDecoration: "none",
                  borderLeft: "2px solid transparent",
                  transition: "border-left-color 0.12s, background 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = "rgba(0,255,136,0.3)";
                  e.currentTarget.style.background = "#0A0A0A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: tag.variant === "plain"
                      ? "repeating-linear-gradient(45deg, #0A0A0A 0 6px, #0C0C0C 6px 12px)"
                      : "#0A0A0A",
                    border: "1px solid #141414",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span
                    className="font-display"
                    style={{ fontSize: "14px", color: "#2A2A2A", letterSpacing: "0.1em" }}
                  >
                    {initials}
                  </span>
                </div>

                {/* Body */}
                <div style={{ minWidth: 0 }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: "16px",
                      letterSpacing: "0.04em",
                      color: "#D8D4C8",
                      lineHeight: 1.15,
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ex.name}
                  </div>
                  <div
                    className="font-body"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                      color: "#6A6A66",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ex.muscle_primary.slice(0, 1).map((m) => m.replace(/_/g, " ").toUpperCase()).join("")}
                    {ex.muscle_primary.length > 0 && ex.reps_default && (
                      <span style={{ color: "#3A3A3A", margin: "0 6px" }}>·</span>
                    )}
                    {ex.reps_default && ex.reps_default.toUpperCase()}
                    {ex.reps_default && " WDH"}
                  </div>
                </div>

                {/* Tag */}
                <span
                  className="font-display"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.22em",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                    border: tag.variant === "accent"
                      ? "1px solid rgba(0,255,136,0.3)"
                      : tag.variant === "ki"
                      ? "1px solid rgba(0,255,136,0.25)"
                      : "1px solid #242424",
                    color: tag.variant !== "plain" ? "#00FF88" : "#8A8A84",
                    background: tag.variant === "ki" ? "rgba(0,255,136,0.04)" : "transparent",
                  }}
                >
                  {tag.label}
                </span>

                {/* Chevron */}
                <span className="font-display" style={{ fontSize: "18px", color: "#3A3A3A", lineHeight: 1 }}>›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
