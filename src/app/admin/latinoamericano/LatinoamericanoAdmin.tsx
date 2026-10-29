"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  id: number;
  nombre: string;
  nacionalidad: string;
  categoria: string;
  equipo: string;
  carpa: boolean;
  correo: string;
  sheet_synced: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  paises: number;
  porCategoria: { categoria: string; count: number }[];
  sheetSynced: number;
}

export default function LatinoamericanoAdmin() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/latinoamericano");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setRows(data.rows ?? []);
      setStats(data.stats ?? null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("es");
    return rows.filter((r) => {
      if (catFilter && r.categoria !== catFilter) return false;
      if (!q) return true;
      return (
        r.nombre.toLocaleLowerCase("es").includes(q) ||
        r.equipo.toLocaleLowerCase("es").includes(q) ||
        r.nacionalidad.toLowerCase().includes(q)
      );
    });
  }, [rows, search, catFilter]);

  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const r of visible) next.delete(r.id);
      } else {
        for (const r of visible) next.add(r.id);
      }
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeOne = async (row: Row) => {
    if (!confirm(`¿Borrar el pre-registro de "${row.nombre}"?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/latinoamericano/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage(`Borrado: ${row.nombre}`);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const removeSelected = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`¿Borrar ${ids.length} pre-registro${ids.length > 1 ? "s" : ""}?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/latinoamericano", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage(`Borrados: ${data.deleted ?? ids.length}`);
      setSelected(new Set());
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
            Panel de administración
          </p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
            Latinoamericano — Pre-registros
          </h1>
        </div>
        <a
          href="/latinoamericano#pre-inscritos"
          target="_blank"
          className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-[#4C8DFF]/60"
        >
          Ver en el sitio ↗
        </a>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Pre-registros", value: stats?.total ?? "—" },
          { label: "Países", value: stats?.paises ?? "—" },
          {
            label: "En el Sheet",
            value: stats ? `${stats.sheetSynced}/${stats.total}` : "—",
          },
          { label: "Seleccionados", value: selected.size },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 px-4 py-3"
          >
            <p className="font-display text-2xl font-black tabular-nums text-white">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros + acciones */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="admin-label" htmlFor="la-admin-search">
            Buscar (nombre, equipo o país)
          </label>
          <input
            id="la-admin-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ej. Rok, FMV, CR…"
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="la-admin-cat">
            Categoría
          </label>
          <select
            id="la-admin-cat"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="admin-input w-52"
          >
            <option value="">Todas</option>
            {stats?.porCategoria.map((c) => (
              <option key={c.categoria} value={c.categoria}>
                {c.categoria} ({c.count})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={removeSelected}
          disabled={busy || selected.size === 0}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40"
        >
          Borrar seleccionados ({selected.size})
        </button>
      </div>

      {message ? (
        <p
          className={`mt-3 text-sm ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      {/* Tabla */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--line)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos los visibles"
                  className="accent-[#4C8DFF]"
                />
              </th>
              <th className="px-3 py-2.5 font-bold">Piloto</th>
              <th className="px-3 py-2.5 font-bold">País</th>
              <th className="px-3 py-2.5 font-bold">Categoría</th>
              <th className="px-3 py-2.5 font-bold">Equipo</th>
              <th className="px-3 py-2.5 font-bold">Correo</th>
              <th className="px-3 py-2.5 font-bold">Carpa</th>
              <th className="px-3 py-2.5 font-bold">Sheet</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-dim)]">
                  Cargando…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-dim)]">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} className="border-t border-[var(--line)] hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      aria-label={`Seleccionar ${r.nombre}`}
                      className="accent-[#4C8DFF]"
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold text-white">{r.nombre}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.nacionalidad}</td>
                  <td className="px-3 py-2 text-xs">{r.categoria}</td>
                  <td className="px-3 py-2 text-xs text-[var(--text-dim)]">{r.equipo}</td>
                  <td className="max-w-[180px] truncate px-3 py-2 text-xs text-[var(--text-dim)]" title={r.correo}>
                    {r.correo || "—"}
                  </td>
                  <td className="px-3 py-2 text-center text-xs">
                    {r.carpa ? (
                      <span className="text-[#E8B84B]" aria-label="sí">
                        ●
                      </span>
                    ) : (
                      <span className="text-[var(--text-dim)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.sheet_synced ? (
                      <span className="text-emerald-400" title="Sincronizado con el Sheet">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[var(--text-dim)]" title="Pendiente de Sheet">
                        …
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeOne(r)}
                      disabled={busy}
                      className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] transition-colors hover:text-red-400 disabled:opacity-40"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[var(--text-dim)]">
        Borrar en el admin elimina de la base (lo que ve el sitio) y hace intento de borrar
        también la fila del Google Sheet compartido con los organizadores.
      </p>
    </div>
  );
}
