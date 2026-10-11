"use client";

import { useEffect, useState } from "react";

interface Props {
  targetIso: string;
}

function split(ms: number) {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export default function NextRaceCountdown({ targetIso }: Props) {
  // null en SSR + primer render de cliente → evita hydration mismatch con Date.now()
  const [left, setLeft] = useState<ReturnType<typeof split>>(null);

  useEffect(() => {
    const tick = () =>
      setLeft(split(new Date(targetIso).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetIso]);

  const cells: Array<[string, number | null]> = [
    ["Días", left?.d ?? null],
    ["Horas", left?.h ?? null],
    ["Min", left?.m ?? null],
    ["Seg", left?.s ?? null],
  ];

  return (
    <div
      className="grid grid-cols-4 gap-2"
      role="timer"
      aria-label="Cuenta regresiva a la próxima fecha"
    >
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-[var(--line)] bg-[var(--ink-950)]/60 px-2 py-2.5 text-center"
        >
          <span className="block font-mono text-xl font-bold tabular-nums text-white sm:text-2xl">
            {value === null ? "··" : String(value).padStart(2, "0")}
          </span>
          <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
