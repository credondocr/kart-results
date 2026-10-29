"use client";

import { useMemo } from "react";
import { useLatinoamericano } from "./LatinoamericanoStore";
import { CUPOS, ORDEN_CATEGORIAS, etiquetaCategoria, normalizarCategoria } from "./data";

/**
 * Medidores por categoría. Sin cupos configurados, las barras son relativas
 * al máximo (la más llena = 100%). Con CUPOS definidos, pasan a progreso real.
 */
export default function CategoryMeters() {
  const { submissions } = useLatinoamericano();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of submissions) {
      const key = normalizarCategoria(s.categoria);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [submissions]);

  const rows = useMemo(() => {
    const known = ORDEN_CATEGORIAS.map((cat) => {
      const key = normalizarCategoria(cat);
      const count = counts.get(key) ?? 0;
      const cupo = CUPOS[cat];
      return { cat: etiquetaCategoria(cat), count, cupo };
    });
    const extras = [...counts.entries()]
      .filter(([key]) => !ORDEN_CATEGORIAS.some((c) => normalizarCategoria(c) === key))
      .map(([key, count]) => ({ cat: key, count, cupo: undefined as number | undefined }));
    return [...known, ...extras].sort((a, b) => b.count - a.count || a.cat.localeCompare(b.cat, "es"));
  }, [counts]);

  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((acc, r) => acc + r.count, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-[var(--text-dim)]">
        Las barras aparecen cuando empiecen a llegar los pre-registros.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = r.cupo
          ? Math.min(100, Math.round((r.count / Math.max(1, r.cupo)) * 100))
          : r.count === 0
            ? 0
            : Math.round((r.count / max) * 100);
        return (
          <li key={r.cat} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-xs font-semibold text-[var(--text)]">
              {r.cat}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--text-dim)]">
              {r.count}
              {r.cupo ? ` / ${r.cupo}` : ""}
            </span>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[#4C8DFF] transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
