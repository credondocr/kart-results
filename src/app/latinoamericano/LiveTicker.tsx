"use client";

import Image from "next/image";
import { useLatinoamericano } from "./LatinoamericanoStore";
import { sufijoEquipo } from "./data";

/**
 * Franja tipo "lower third" de transmisión: últimos pre-registros desfilando.
 * Pausa en hover; con prefers-reduced-motion el track queda estático (scroll manual).
 */
export default function LiveTicker() {
  const { submissions, loading } = useLatinoamericano();

  const items = submissions.slice(-18).reverse();

  if (!loading && items.length === 0) return null;

  const label = (
    <span className="flex shrink-0 items-center gap-2 border-r border-[var(--line)] bg-[var(--signal-dim)] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4C8DFF]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4C8DFF] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4C8DFF]" />
      </span>
      Pre-registro abierto
    </span>
  );

  const trackItems =
    items.length > 0
      ? items
      : Array.from({ length: 6 }, () => null);

  const renderPiloto = (s: { nombre: string; nacionalidad: string; categoria: string; equipo: string } | null, i: number) => {
    if (!s) {
      return (
        <span key={`s-${i}`} className="flex items-center gap-2.5 px-5 text-xs text-[var(--text-dim)]">
          Cargando parrilla…
        </span>
      );
    }
    return (
      <span key={`${s.nombre}-${i}`} className="flex shrink-0 items-center gap-2.5 px-5 text-xs">
        <Image
          src={`https://flagcdn.com/w40/${s.nacionalidad.toLowerCase()}.png`}
          alt=""
          width={20}
          height={15}
          className="h-3.5 w-5 rounded-[2px] object-cover"
        />
        <span className="font-semibold text-white">{s.nombre}</span>
        <span className="text-[var(--text-dim)]">{sufijoEquipo(s.equipo)}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#4C8DFF]">
          {s.categoria}
        </span>
      </span>
    );
  };

  return (
    <div
      className="la-ticker relative z-10 flex overflow-hidden border-y border-[var(--line)] bg-[var(--surface)]/70 backdrop-blur-sm"
      aria-label="Últimos pilotos pre-inscritos"
    >
      {label}
      <div className="relative flex-1 overflow-hidden">
        <div className="la-ticker-track flex w-max items-center py-2.5">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {trackItems.map((s, i) => renderPiloto(s, i))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--ink-950)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--ink-950)] to-transparent" />
      </div>
    </div>
  );
}
