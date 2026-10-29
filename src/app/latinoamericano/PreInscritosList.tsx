"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useLatinoamericano } from "./LatinoamericanoStore";
import {
  ORDEN_CATEGORIAS,
  etiquetaCategoria,
  normalizarCategoria,
  type PreRegistro,
} from "./data";

type Tab = "todos" | "categorias";

function countryLabel(code: string): string {
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function PilotRow({ s }: { s: PreRegistro }) {
  const code = s.nacionalidad?.trim().toUpperCase();
  return (
    <li className="group flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.03]">
      {code && code.length === 2 ? (
        <Image
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt=""
          width={24}
          height={18}
          className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
        />
      ) : (
        <span className="h-4 w-6 shrink-0" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text)]">
        {s.nombre}
        {s.equipo && !/^no tengo equipo$/i.test(s.equipo.trim()) ? (
          <span className="text-[var(--text-dim)]"> — {s.equipo}</span>
        ) : null}
      </span>
    </li>
  );
}

function PilotList({ items, empty }: { items: PreRegistro[]; empty: string }) {
  if (items.length === 0) {
    return <p className="px-3 py-6 text-sm text-[var(--text-dim)]">{empty}</p>;
  }
  return (
    <ul className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/30">
      {items.map((s, i) => (
        <PilotRow key={`${s.nombre}-${s.nacionalidad}-${i}`} s={s} />
      ))}
    </ul>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
        {label}
      </h4>
      <span className="font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
        {count}
      </span>
      <div className="h-px flex-1 bg-[var(--line)]" />
    </div>
  );
}

/**
 * Parrilla de pre-inscritos con la UX del modal original:
 * tabs (todos / por categoría), filtro de países con banderas,
 * split internacionales vs nacionales — en tema oscuro del sitio.
 */
export default function PreInscritosList() {
  const { submissions, loading } = useLatinoamericano();
  const [tab, setTab] = useState<Tab>("todos");
  const [pais, setPais] = useState<string | null>(null);

  const porNombre = useCallback(
    (a: PreRegistro, b: PreRegistro) =>
      a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base", numeric: true }),
    []
  );

  const paises = useMemo(() => {
    const set = new Set(
      submissions.map((s) => s.nacionalidad?.trim().toUpperCase()).filter((c) => c?.length === 2)
    );
    return [...set].sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), "es"));
  }, [submissions]);

  const filtrar = (items: PreRegistro[]) =>
    pais ? items.filter((s) => s.nacionalidad?.trim().toUpperCase() === pais) : items;

  const internacionales = useMemo(
    () =>
      filtrar(submissions.filter((s) => s.nacionalidad?.trim().toUpperCase() !== "CR")).sort(
        porNombre
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submissions, pais, porNombre]
  );

  const nacionales = useMemo(
    () =>
      filtrar(submissions.filter((s) => s.nacionalidad?.trim().toUpperCase() === "CR")).sort(
        porNombre
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submissions, pais, porNombre]
  );

  const porCategoria = useMemo(() => {
    const map = new Map<string, { label: string; items: PreRegistro[] }>();
    for (const s of filtrar(submissions)) {
      const key = normalizarCategoria(s.categoria) || "sin-categoria";
      if (!map.has(key)) {
        map.set(key, { label: etiquetaCategoria(s.categoria) || "Otras", items: [] });
      }
      map.get(key)!.items.push(s);
    }
    const known: typeof map = new Map();
    const extras: typeof map = new Map();
    for (const [key, val] of map) {
      const isKnown = ORDEN_CATEGORIAS.some((c) => normalizarCategoria(c) === key);
      (isKnown ? known : extras).set(key, val);
    }
    const keys = [
      ...ORDEN_CATEGORIAS.map((c) => normalizarCategoria(c)).filter((k) => known.has(k)),
      ...[...extras.keys()].sort(),
    ];
    return keys.map((k) => {
      const g = known.get(k) ?? extras.get(k)!;
      return { ...g, items: [...g.items].sort(porNombre) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions, pais, porNombre]);

  const total = submissions.length;

  if (!loading && total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line-strong)] px-6 py-14 text-center">
        <p className="font-display text-xl font-black uppercase tracking-tight text-white">
          La parrilla está vacía
        </p>
        <p className="mt-2 text-sm text-[var(--text-dim)]">
          Todavía no hay pre-registros. Sé el primero en aparecer acá.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-11 animate-pulse rounded-lg bg-white/[0.04]"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "todos", label: "Todos los pilotos" },
    { id: "categorias", label: "Por categorías" },
  ];

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/30">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-white">
          Preinscritos
        </h3>
        <p className="text-sm text-[var(--text-dim)]">
          <span className="font-mono font-bold tabular-nums text-white">{total}</span>{" "}
          {total === 1 ? "piloto registrado" : "pilotos registrados"}
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Cómo ver la lista de pilotos"
          className="mb-5 flex rounded-lg border border-[var(--line)] bg-white/[0.03] p-1"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-md px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all sm:text-sm ${
                tab === t.id
                  ? "bg-[#4C8DFF] text-white shadow"
                  : "text-[var(--text-dim)] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "todos" ? (
          <div role="tabpanel" aria-label="Todos los pilotos">
            {/* Filtro de países */}
            <div className="mb-6 rounded-xl border border-[var(--line)] bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center gap-2">
                <p
                  id="la-flags-label"
                  className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]"
                >
                  Países presentes
                </p>
                <span
                  className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-[#4C8DFF] px-1.5 font-mono text-[11px] font-bold tabular-nums text-white"
                  aria-label={`${paises.length} países distintos`}
                >
                  {paises.length}
                </span>
              </div>
              <div
                role="toolbar"
                aria-orientation="horizontal"
                aria-labelledby="la-flags-label"
                className="flex gap-2 overflow-x-auto pb-1"
              >
                <button
                  type="button"
                  onClick={() => setPais(null)}
                  aria-pressed={pais === null}
                  className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all ${
                    pais === null
                      ? "border-[#4C8DFF] bg-[#4C8DFF]/15 text-white"
                      : "border-[var(--line-strong)] text-[var(--text-dim)] hover:border-white/25 hover:text-white"
                  }`}
                >
                  Todos
                </button>
                {paises.map((code) => {
                  const selected = pais === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPais(selected ? null : code)}
                      aria-pressed={selected}
                      aria-label={`Solo pilotos de ${countryLabel(code)}`}
                      title={countryLabel(code)}
                      className={`shrink-0 rounded-lg border p-1.5 transition-all ${
                        selected
                          ? "border-[#4C8DFF] bg-[#4C8DFF]/15"
                          : "border-[var(--line-strong)] hover:border-white/25"
                      }`}
                    >
                      <Image
                        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
                        alt=""
                        width={32}
                        height={22}
                        className="h-5 w-8 rounded-[2px] object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listas */}
            {pais ? (
              <div>
                <GroupHeader
                  label={`Pilotos de ${countryLabel(pais)}`}
                  count={filtrar(submissions).length}
                />
                <PilotList
                  items={[...filtrar(submissions)].sort(porNombre)}
                  empty={`No hay pilotos de ${countryLabel(pais)} todavía.`}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <GroupHeader label="Pilotos internacionales" count={internacionales.length} />
                  <PilotList
                    items={internacionales}
                    empty="Aún no hay pilotos internacionales."
                  />
                </div>
                <div>
                  <GroupHeader label="Pilotos nacionales" count={nacionales.length} />
                  <PilotList items={nacionales} empty="Aún no hay pilotos nacionales." />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div role="tabpanel" aria-label="Por categorías" className="space-y-8">
            {porCategoria.map((g) => (
              <div key={g.label}>
                <GroupHeader label={g.label} count={g.items.length} />
                <PilotList items={g.items} empty="Sin pre-registros en esta categoría." />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
