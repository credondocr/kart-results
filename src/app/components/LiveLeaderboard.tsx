"use client";

import React, { useEffect, useRef, useState } from "react";
import type { LiveActivePayload, LiveRow } from "@/app/utils/liveTiming";

interface LiveLeaderboardProps {
  eventId: string;
  initialActive: LiveActivePayload | null;
  pollMs?: number;
}

interface ApiResponse {
  ok: boolean;
  active?: LiveActivePayload | null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "00:20:20.000" → "20:20"; "5:03.21" → "5:03.21"; ms se muestran en vueltas. */
function formatLap(raw?: string): string {
  if (!raw) return "—";
  return raw;
}

function formatGap(raw?: string, isLeader = false): string {
  if (isLeader) return "LÍDER";
  if (raw == null || raw === "") return "—";
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return `+${n.toFixed(3)}`;
}

function formatClock(rcTm?: string): string | null {
  if (!rcTm) return null;
  const [hms] = rcTm.split(".");
  const [h, m, s] = hms.split(":").map(Number);
  if ([h, m, s].some((v) => Number.isNaN(v))) return rcTm;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

const LiveDot: React.FC = () => (
  <span className="relative inline-flex h-2.5 w-2.5" aria-hidden="true">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
  </span>
);

export default function LiveLeaderboard({
  eventId,
  initialActive,
  pollMs = 8000,
}: LiveLeaderboardProps) {
  const [active, setActive] = useState<LiveActivePayload | null>(initialActive);
  const [updatedAt, setUpdatedAt] = useState<number | null>(
    initialActive ? Date.now() : null
  );
  const [error, setError] = useState(false);
  const prevPosRef = useRef<Map<string, string>>(new Map());
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/live/${eventId}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError(true);
          return;
        }
        const data: ApiResponse = await res.json();
        if (cancelled) return;
        setError(false);
        if (data.active) {
          const prev = prevPosRef.current;
          const next = new Map<string, string>();
          const changed = new Set<string>();
          for (const row of data.active.l ?? []) {
            if (!row.id) continue;
            const old = prev.get(row.id);
            next.set(row.id, row.pos ?? "");
            if (old !== undefined && old !== row.pos) changed.add(row.id);
          }
          prevPosRef.current = next;
          setChangedIds(changed);
          setActive(data.active);
          setUpdatedAt(Date.now());
        } else {
          setActive(null);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };

    const interval = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [eventId, pollMs]);

  const rows: LiveRow[] = active?.l ?? [];
  const clock = formatClock(active?.rcTm);
  const lapsLabel =
    active?.ls != null
      ? active.lsTg
        ? `Vuelta ${active.ls}/${active.ls + active.lsTg}`
        : `${active.ls} vueltas`
      : null;

  if (!active || rows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]">
          Sin sesión activa
        </p>
        <p className="mt-2 text-sm text-[var(--text-dim)]">
          El cronómetro está fuera de servicio o aún no inicia la próxima
          sesión. Los resultados finales aparecen en la página del evento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <LiveDot />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
              En vivo
            </p>
            <h3 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
              {active.rnNam ?? "Sesión"}
              {active.gNam ? (
                <span className="ml-2 text-sm font-bold text-[#4C8DFF]">
                  {active.gNam}
                </span>
              ) : null}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          {clock ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Tiempo restante
              </p>
              <p className="font-mono text-lg font-bold tabular-nums text-white">
                {clock}
              </p>
            </div>
          ) : null}
          {lapsLabel ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Vueltas
              </p>
              <p className="font-mono text-lg font-bold tabular-nums text-white">
                {lapsLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="table-wrapper overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
              <th className="px-3 py-2 text-left font-bold">Pos</th>
              <th className="px-2 py-2 text-left font-bold">Nº</th>
              <th className="px-3 py-2 text-left font-bold">Piloto</th>
              <th className="px-3 py-2 text-right font-bold">Gap</th>
              <th className="px-3 py-2 text-right font-bold">Mejor</th>
              <th className="hidden px-3 py-2 text-right font-bold sm:table-cell">
                Última
              </th>
              <th className="px-3 py-2 text-right font-bold">Vueltas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const posNum = Number(row.pos);
              const podiumClass =
                posNum >= 1 && posNum <= 3 ? `podium-${posNum}` : "";
              const isLeader = row.gp == null || row.gp === "" || posNum === 1;
              const flash = row.id && changedIds.has(row.id);
              return (
                <tr
                  key={row.id ?? `${row.no}-${row.nam}`}
                  className={`${podiumClass} border-t border-[var(--line)] transition-colors duration-500 ${
                    flash ? "bg-[#4C8DFF]/15" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span className="rank-chip">{row.pos ?? "—"}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="race-number">{row.no ?? row.dNo}</span>
                  </td>
                  <td className="max-w-[180px] truncate px-3 py-2.5 font-semibold text-white sm:max-w-none">
                    {row.nam ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[var(--text-dim)]">
                    {formatGap(row.gp, isLeader)}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      row.ibt ? "font-bold text-[var(--gold)]" : "text-white"
                    }`}
                  >
                    {formatLap(row.btTm)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right font-mono tabular-nums text-[var(--text-dim)] sm:table-cell">
                    {formatLap(row.lsTm)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[var(--text-dim)]">
                    {row.ls ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2 text-[11px] text-[var(--text-dim)]">
        <span>
          {error
            ? "Reconectando… mostrando últimos datos"
            : "Actualización automática"}
        </span>
        {updatedAt ? (
          <span className="font-mono tabular-nums">
            {new Date(updatedAt).toLocaleTimeString("es-CR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
