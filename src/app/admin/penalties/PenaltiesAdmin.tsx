"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

const YEARS = ["2019", "2020", "2021", "2022", "2023"];

interface PenaltyRow {
  id: number;
  year: string;
  season: string;
  fecha: number;
  cls: string;
  driver: string;
  delta: number;
  note: string | null;
}

export default function AdminPenaltiesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PenaltyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("2023");
  const [message, setMessage] = useState<string | null>(null);

  const [year, setYear] = useState("2023");
  const [season, setSeason] = useState("invierno");
  const [fecha, setFecha] = useState("1");
  const [cls, setCls] = useState("");
  const [driver, setDriver] = useState("");
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = yearFilter ? `?year=${yearFilter}` : "";
      const res = await fetch(`/api/admin/penalties${params}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setRows(data.penalties ?? []);
    } finally {
      setLoading(false);
    }
  }, [router, yearFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          season,
          fecha: Number(fecha),
          cls,
          driver,
          delta: Number(delta),
          note: note || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Guardado ✓ (se aplica en el próximo deploy)");
      setCls("");
      setDriver("");
      setDelta("");
      setNote("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("¿Borrar esta penalización?")) return;
    const res = await fetch(`/api/admin/penalties/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Penales (histórico)
            </h1>
          </div>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <p className="mt-4 max-w-3xl text-xs text-[var(--text-dim)]">
          Ajustes manuales de puntos <strong>solo para temporadas históricas</strong>{" "}
          (2019–2023), que se calculan desde SpeedHive sin penales oficiales. Se
          aplican al recalcular los standings en cada deploy. Los campeonatos
          2024+ usan los puntos oficiales de PointMerge y no se tocan.
        </p>

        <form
          className="mt-6 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4 sm:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div>
            <label className="admin-label">Año</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="admin-input">
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label">Temporada</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="admin-input"
            >
              <option value="invierno">Invierno</option>
              <option value="verano">Verano</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Fecha</label>
            <input
              type="number"
              min={1}
              max={20}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Categoría (como en SpeedHive)</label>
            <input
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              placeholder="ej. VLR Senior"
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-label">Δ Puntos</label>
            <input
              type="number"
              step="0.5"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="-10"
              className="admin-input"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="admin-label">Piloto</label>
            <input
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="Nombre del piloto"
              className="admin-input"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Nota (opcional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ej. largó desde el pits"
              className="admin-input"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Agregar"}
            </button>
          </div>
          {message ? (
            <p
              className={`sm:col-span-6 text-sm ${
                message.startsWith("Error") ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>

        <div className="mt-6 flex items-center gap-3">
          <label className="admin-label mb-0">Filtrar año</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="admin-input w-32"
          >
            <option value="">Todos</option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                <th className="px-4 py-2.5 font-bold">Año</th>
                <th className="px-3 py-2.5 font-bold">Temp.</th>
                <th className="px-3 py-2.5 font-bold">Fecha</th>
                <th className="px-3 py-2.5 font-bold">Categoría</th>
                <th className="px-3 py-2.5 font-bold">Piloto</th>
                <th className="px-3 py-2.5 font-bold">Δ</th>
                <th className="px-3 py-2.5 font-bold">Nota</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Sin penalizaciones registradas.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-2 font-mono text-xs">{r.year}</td>
                    <td className="px-3 py-2">{r.season}</td>
                    <td className="px-3 py-2 font-mono">{r.fecha}</td>
                    <td className="px-3 py-2">{r.cls}</td>
                    <td className="px-3 py-2 font-semibold text-white">{r.driver}</td>
                    <td
                      className={`px-3 py-2 font-mono font-bold ${
                        r.delta < 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {r.delta > 0 ? `+${r.delta}` : r.delta}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--text-dim)]">{r.note ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => remove(r.id)}
                        className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-red-400"
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
      </div>
    </div>
  );
}
