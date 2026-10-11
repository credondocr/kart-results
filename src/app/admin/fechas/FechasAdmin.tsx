"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface RaceDate {
  id: number;
  name: string;
  race_date: string;
  status: string;
  location: string | null;
  categories: string[];
  price_base: number | null;
}

const DEFAULT_CATS = [
  "KID KART",
  "STARS OF TOMORROW",
  "MINI ROK",
  "MICRO ROK",
  "LO 206",
  "TILLOTSON",
  "VLR",
  "ROK SHIFTER",
];

export default function AdminFechasPage() {
  const router = useRouter();
  const [dates, setDates] = useState<RaceDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [location, setLocation] = useState("Costa Rica");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATS);
  const [priceBase, setPriceBase] = useState("35000");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<RaceDate | null>(null);
  const [editCats, setEditCats] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/race-dates");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setDates(data.dates ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCat = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/race-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          race_date: raceDate,
          location,
          categories,
          price_base: priceBase || null,
          status: "open",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Fecha creada e inscripciones abiertas ✓");
      setName("");
      setRaceDate("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id: number, status: string) => {
    if (status === "open" && !confirm("¿Abrir inscripciones para esta fecha? Solo puede haber una abierta.")) return;
    const res = await fetch(`/api/admin/race-dates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(`Error: ${data.error ?? res.status}`);
      return;
    }
    setMessage(null);
    await load();
  };

  const openEdit = (d: RaceDate) => {
    setEditing(d);
    setEditCats(d.categories ?? []);
    setEditName(d.name);
    setEditPrice(d.price_base != null ? String(d.price_base) : "");
    setEditLocation(d.location ?? "");
    setMessage(null);
  };

  const toggleEditCat = (c: string) => {
    setEditCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const allCats = Array.from(
    new Set([...DEFAULT_CATS, ...dates.flatMap((d) => d.categories ?? [])])
  );

  const saveEdit = async () => {
    if (!editing) return;
    if (!editCats.length) {
      setMessage("Error: deja al menos una categoría habilitada");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/race-dates/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          location: editLocation || null,
          price_base: editPrice || null,
          categories: editCats,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Fecha actualizada ✓");
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
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
              Fechas
            </h1>
          </div>
        </div>
        <div className="mt-4">
          <AdminNav />
        </div>

        <form
          onSubmit={create}
          className="mt-6 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
            Nueva fecha (abre inscripciones)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="CRKC — Fecha X"
              required
              className="admin-input sm:col-span-2"
            />
            <input
              type="datetime-local"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
              required
              className="admin-input"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="admin-input"
              placeholder="Circuito"
            />
            <input
              type="number"
              min="0"
              step="500"
              value={priceBase}
              onChange={(e) => setPriceBase(e.target.value)}
              className="admin-input"
              placeholder="Precio por categoría ₡"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_CATS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCat(c)}
                className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  categories.includes(c)
                    ? "border-[#4C8DFF]/60 bg-[#4C8DFF]/15 text-[#4C8DFF]"
                    : "border-[var(--line)] text-[var(--text-dim)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
          >
            {saving ? "Creando…" : "Crear e abrir"}
          </button>
          {message ? (
            <p
              className={`text-sm ${
                message.startsWith("Error") ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {message}
            </p>
          ) : null}
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                <th className="px-4 py-2.5 font-bold">Nombre</th>
                <th className="px-3 py-2.5 font-bold">Fecha</th>
                <th className="px-3 py-2.5 font-bold">Estado</th>
                <th className="px-3 py-2.5 font-bold">Precio/cat</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Cargando…
                  </td>
                </tr>
              ) : dates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Sin fechas todavía.
                  </td>
                </tr>
              ) : (
                dates.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-t border-[var(--line)] hover:bg-white/[0.03]"
                    onClick={() => openEdit(d)}
                  >
                    <td className="px-4 py-2 font-semibold text-white">
                      {d.name}
                      <span className="mt-0.5 block text-[11px] font-normal text-[var(--text-dim)]">
                        {(d.categories ?? []).length} categorías · clic para editar
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-dim)]">
                      {new Date(d.race_date).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                          d.status === "open"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : d.status === "done"
                              ? "bg-white/5 text-[var(--text-dim)]"
                              : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {d.price_base != null ? `₡${Number(d.price_base).toLocaleString("es-CR")}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {d.status === "open" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(d.id, "closed");
                          }}
                          className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-red-400"
                        >
                          Cerrar
                        </button>
                      ) : d.status === "closed" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(d.id, "open");
                          }}
                          className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-400"
                        >
                          Abrir
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(d.id, "open");
                          }}
                          className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-white"
                        >
                          Reabrir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editing ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setEditing(null)}>
            <aside
              className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-950)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Editar fecha
                  </p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    {editing.name}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-[var(--text-dim)]">
                    {new Date(editing.race_date).toLocaleString("es-CR")}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  aria-label="Cerrar"
                  className="text-2xl leading-none text-[var(--text-dim)] hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="admin-label">Nombre</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">Circuito</label>
                    <input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Precio por cat. ₡</label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">
                    Categorías habilitadas para inscripción
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allCats.map((c) => {
                      const on = editCats.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleEditCat(c)}
                          aria-pressed={on}
                          className={`rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                            on
                              ? "border-[#4C8DFF]/60 bg-[#4C8DFF]/15 text-[#4C8DFF]"
                              : "border-[var(--line)] text-[var(--text-dim)] opacity-50 line-through"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--text-dim)]">
                    Las categorías apagadas no aparecen en el formulario de
                    inscripción.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                {message ? (
                  <p
                    className={`text-sm ${
                      message.startsWith("Error") ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {message}
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
