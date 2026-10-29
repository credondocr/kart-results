"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLatinoamericano } from "./LatinoamericanoStore";

type Entry = { code: string; count: number; label: string };

/** Mejor esfuerzo: nombre en español desde Intl; fallback al código. */
function countryLabel(code: string): string {
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

/**
 * Muro de banderas con top 3 destacado (podium de países) y el resto en chips.
 * Evoca la tira de banderas del póster oficial.
 */
export default function CountryWall() {
  const { submissions } = useLatinoamericano();

  const { top, rest, total } = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of submissions) {
      const code = s.nacionalidad?.trim().toUpperCase();
      if (!code || code.length !== 2) continue;
      map.set(code, (map.get(code) ?? 0) + 1);
    }
    const entries: Entry[] = [...map.entries()]
      .map(([code, count]) => ({ code, count, label: countryLabel(code) }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
    return {
      top: entries.slice(0, 3),
      rest: entries.slice(3),
      total: entries.length,
    };
  }, [submissions]);

  if (total === 0) return null;

  const podiumPlace = ["1ro", "2do", "3ro"];

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {top.map((c, i) => (
          <div
            key={c.code}
            className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-center ${
              i === 0
                ? "border-[#E8B84B]/40 bg-[#E8B84B]/5"
                : "border-[var(--line)] bg-[var(--surface-2)]/40"
            }`}
          >
            <Image
              src={`https://flagcdn.com/w160/${c.code.toLowerCase()}.png`}
              alt={`Bandera de ${c.label}`}
              width={64}
              height={48}
              className="h-9 w-12 rounded object-cover shadow"
            />
            <span className="font-display text-2xl font-black tabular-nums leading-none text-white">
              {c.count}
            </span>
            <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-dim)]">
              {c.label}
            </span>
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.18em] ${
                i === 0 ? "text-[#E8B84B]" : "text-[var(--text-dim)]"
              }`}
            >
              {podiumPlace[i]}
            </span>
          </div>
        ))}
      </div>
      {rest.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {rest.map((c) => (
            <li
              key={c.code}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/[0.03] py-1 pl-1 pr-2.5"
            >
              <Image
                src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                alt=""
                width={20}
                height={15}
                className="h-3.5 w-5 rounded-[2px] object-cover"
              />
              <span className="font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
                {c.count}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
