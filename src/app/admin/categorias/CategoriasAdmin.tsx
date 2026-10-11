"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
}

export default function AdminCategoriasPage() {
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setCats(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, active: true, sort_order: cats.length }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Categoría creada ✓");
      setName("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Category) => {
    const res = await fetch(`/api/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) await load();
  };

  const rename = async (c: Category, newName: string) => {
    const res = await fetch(`/api/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) await load();
  };

  const remove = async (c: Category) => {
    if (!confirm(`¿Eliminar "${c.name}"? No se borrará de fechas ya creadas.`))
      return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Categorías
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-xs text-[var(--text-dim)]">
          Las categorías <strong className="text-emerald-400">activas</strong> se
          muestran en el marquee del landing y en el selector al crear una fecha.
          Las inactivas quedan ocultas para pilotos pero se conservan en fechas
          ya publicadas.
        </p>

        <form onSubmit={create} className="mt-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nueva categoría (ej. VLR Senior)"
            required
            className="admin-input max-w-md"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
          >
            {saving ? "Creando…" : "Agregar"}
          </button>
        </form>
        {message ? (
          <p
            className={`mt-3 text-sm ${
              message.startsWith("Error") ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                <th className="px-4 py-2.5 font-bold">Orden</th>
                <th className="px-3 py-2.5 font-bold">Nombre</th>
                <th className="px-3 py-2.5 font-bold">Slug</th>
                <th className="px-3 py-2.5 font-bold">Activa</th>
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
              ) : cats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Sin categorías.
                  </td>
                </tr>
              ) : (
                cats.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-2 font-mono text-xs text-[var(--text-dim)]">
                      {c.sort_order}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        defaultValue={c.name}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== c.name) rename(c, v);
                        }}
                        className={`w-full rounded-md border border-transparent bg-transparent px-2 py-1 font-semibold text-white hover:border-[var(--line)] focus:border-[#4C8DFF] focus:outline-none ${
                          c.active ? "" : "opacity-50"
                        }`}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[var(--text-dim)]">
                      {c.slug}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggle(c)}
                        role="switch"
                        aria-checked={c.active}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          c.active ? "bg-emerald-500/80" : "bg-white/15"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            c.active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => remove(c)}
                        className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-red-400"
                      >
                        Eliminar
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
