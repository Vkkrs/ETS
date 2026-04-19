"use client";

import { useState } from "react";

type IntelState = "empty" | "filled" | "loading";

export default function IntelSection({ state: initialState }: { state: IntelState }) {
  const [state, setState] = useState<IntelState>(initialState);

  return (
    <div className="px-[22px] pt-[26px]" style={{ borderBottom: "1px solid #0C0C0C" }}>
      <div className="font-display text-[11px] tracking-[0.32em] mb-[14px]" style={{ color: "#8A8A84" }}>
        INTEL · TAGESBRIEF
      </div>

      {state === "loading" ? (
        <div className="pb-[22px]">
          <div className="font-display flex items-center gap-[8px] mb-[16px]" style={{ fontSize: "12px", letterSpacing: "0.42em", color: "#00FF88" }}>
            STAND BY
            <span className="flex gap-[4px]">
              {([0, 0.2, 0.4] as number[]).map((delay, i) => (
                <span
                  key={i}
                  style={{
                    width: "6px", height: "6px",
                    background: "#00FF88",
                    display: "inline-block",
                    animation: `blink 1.2s ${delay}s infinite`,
                  }}
                />
              ))}
            </span>
          </div>
          <div className="font-display" style={{ fontSize: "40px", lineHeight: 0.95, color: "#1E1E1E", letterSpacing: "0.01em" }}>
            GENERIERE<br />SITREP<br />ANALYSE
          </div>
        </div>
      ) : (
        <div className="font-body text-[14px] leading-[1.6] pb-[18px]" style={{ color: "#B8B4A8", letterSpacing: "0.005em" }}>
          {state === "empty" ? (
            <>
              <span style={{ color: "#FAFAF8", fontWeight: 500 }}>Operator File angelegt.</span>{" "}
              Erster Eintrag ausstehend. SITREP generiert nach 3 Logs.
            </>
          ) : (
            <>
              <span style={{ color: "#FAFAF8", fontWeight: 500 }}>Tagesanalyse bereit.</span>{" "}
              Vollständiges SITREP anfordern für detaillierte Auswertung deiner letzten Sessions.
            </>
          )}
        </div>
      )}

      {/* Link */}
      <button
        onClick={() => { if (state !== "loading") setState("loading"); }}
        className="flex items-center gap-[10px] font-display text-[12px] w-full text-left"
        style={{
          letterSpacing: "0.18em",
          color: state === "loading" ? "#3A3A3A" : "#00FF88",
          borderTop: "1px solid #141414",
          paddingTop: "14px",
          paddingBottom: "18px",
          background: "none",
          border: "none",
          borderTop: "1px solid #141414",
        }}
      >
        <span>→</span> VOLLSTÄNDIGES SITREP
      </button>
    </div>
  );
}
