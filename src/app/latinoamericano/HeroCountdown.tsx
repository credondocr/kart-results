"use client";

import { useEffect, useState } from "react";
import { EVENT } from "./data";

type Left = { d: number; h: number; m: number; s: number };

function calc(): Left {
  const diff = new Date(EVENT.startsAt).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1_000) % 60),
  };
}

const CELL = (v: number, l: string) => (
  <div className="flex min-w-0 flex-col items-center gap-1">
    <span className="min-w-[2rem] rounded-md border border-[var(--line-strong)] bg-[var(--ink-950)] px-1.5 py-1.5 text-center font-mono text-base font-bold tabular-nums text-white sm:px-2.5 sm:py-2 sm:text-xl">
      {String(v).padStart(2, "0")}
    </span>
    <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--text-dim)] sm:text-[9px] sm:tracking-[0.16em]">
      {l}
    </span>
  </div>
);

/** Card tipo pit board con la cuenta regresiva al día de apertura. */
export default function HeroCountdown() {
  const [left, setLeft] = useState<Left | null>(null);

  useEffect(() => {
    setLeft(calc());
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-4 backdrop-blur-md sm:p-5">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8B84B]">
        La largada está cada vez más cerca
      </p>
      {left ? (
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          {CELL(left.d, "Días")}
          {CELL(left.h, "Horas")}
          {CELL(left.m, "Min")}
          {CELL(left.s, "Seg")}
        </div>
      ) : (
        <div className="h-[3.6rem]" aria-hidden="true" />
      )}
    </div>
  );
}
