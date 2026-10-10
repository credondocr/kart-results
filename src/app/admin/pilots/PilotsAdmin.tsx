"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface PilotRow {
  key: string;
  name: string;
  team: string | null;
  teams: Record<string, string> | null;
  country: string | null;
  aliases: string[] | null;
  updated_at?: string;
}

interface TeamOption {
  slug: string;
  name: string;
  visible: boolean;
}

interface EditState {
  name: string;
  team: string;
  country: string;
  teams: Array<{ year: string; team: string }>;
  aliases: string;
}

function toEditState(p: PilotRow): EditState {
  return {
    name: p.name,
    team: p.team ?? "",
    country: p.country ?? "CR",
    teams: Object.entries(p.teams ?? {}).map(([year, team]) => ({ year, team })),
    aliases: (p.aliases ?? []).join(", "),
  };
}

export default function PilotsAdmin() {
  const router = useRouter();
  const [pilots, setPilots] = useState<PilotRow[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const limit = 50;

  const load = useCallback(
    async (query: string, off: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
        if (query) params.set("q", query);
        const res = await fetch(`/api/admin/pilots?${params}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setPilots(data.pilots ?? []);
        setTotal(data.total ?? 0);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(0);
      load(q, 0);
    }, 250);
    return () => clearTimeout(t);
  }, [q, load]);

  useEffect(() => {
    fetch("/api/admin/teams")
      .then((res) => (res.ok ? res.json() : { teams: [] }))
      .then((data) => setTeamOptions(data.teams ?? []))
      .catch(() => setTeamOptions([]));
  }, []);

  const openEdit = (p: PilotRow) => {
    setSelectedKey(p.key);
    setEdit(toEditState(p));
    setMessage(null);
  };

  const closeEdit = () => {
    setSelectedKey(null);
    setEdit(null);
  };

  const save = async () => {
    if (!selectedKey || !edit) return;
    setSaving(true);
    setMessage(null);
    try {
      const teams: Record<string, string> = {};
      for (const row of edit.teams) {
        if (row.year.trim() && row.team.trim()) teams[row.year.trim()] = row.team.trim();
      }
      const aliases = edit.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/pilots/${encodeURIComponent(selectedKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: edit.name,
          team: edit.team || null,
          country: edit.country || null,
          teams,
          aliases,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Guardado ✓");
      await load(q, offset);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const selected = pilots.find((p) => p.key === selectedKey) ?? null;

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Pilotos
            </h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-dim)] transition-colors hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, equipo o alias…"
            className="w-full max-w-md rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)]/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#4C8DFF]"
          />
          <p className="font-mono text-xs tabular-nums text-[var(--text-dim)]">
            {total} en total
          </p>
        </div>

        <p className="mt-3 text-xs text-[var(--text-dim)]">
          La DB Neon es la fuente de verdad. Al hacer deploy, los cambios se
          exportan a <code className="text-[#4C8DFF]">pilots.json</code> y el
          sitio estático los usa. Los equipos se crean/editan en la pestaña
          Equipos; aquí solo se asignan.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)]">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                  <th className="px-4 py-2.5 font-bold">Nombre</th>
                  <th className="px-3 py-2.5 font-bold">Equipo actual</th>
                  <th className="px-3 py-2.5 font-bold">País</th>
                  <th className="px-3 py-2.5 font-bold">Aliases</th>
                  <th className="px-3 py-2.5 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-dim)]">
                      Cargando…
                    </td>
                  </tr>
                ) : pilots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[var(--text-dim)]">
                      Sin resultados{q ? ` para “${q}”` : ""}.
                    </td>
                  </tr>
                ) : (
                  pilots.map((p) => (
                    <tr
                      key={p.key}
                      className={`cursor-pointer border-t border-[var(--line)] transition-colors hover:bg-white/[0.03] ${
                        p.key === selectedKey ? "bg-[#4C8DFF]/10" : ""
                      }`}
                      onClick={() => openEdit(p)}
                    >
                      <td className="px-4 py-2.5 font-semibold text-white">{p.name}</td>
                      <td className="px-3 py-2.5 text-[var(--text-dim)]">
                        {p.team
                          ? teamOptions.find((t) => t.slug === p.team)?.name ?? p.team
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--text-dim)]">
                        {p.country ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[var(--text-dim)]">
                        {p.aliases?.length ? p.aliases.join(", ") : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#4C8DFF]">
                          Editar
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] disabled:opacity-40 hover:text-white"
          >
            Anterior
          </button>
          <p className="font-mono text-xs tabular-nums text-[var(--text-dim)]">
            {offset + 1}–{Math.min(offset + limit, total)} de {total}
          </p>
          <button
            disabled={offset + limit >= total || loading}
            onClick={() => setOffset(offset + limit)}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] disabled:opacity-40 hover:text-white"
          >
            Siguiente
          </button>
        </div>

        {selected && edit ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={closeEdit}>
            <aside
              className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-950)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Editar piloto
                  </p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    {selected.name}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-[var(--text-dim)]">
                    key: {selected.key}
                  </p>
                </div>
                <button
                  onClick={closeEdit}
                  aria-label="Cerrar"
                  className="text-2xl leading-none text-[var(--text-dim)] hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="admin-label">Nombre visible</label>
                  <input
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    className="admin-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="admin-label">Equipo actual</label>
                    <select
                      value={edit.team}
                      onChange={(e) => setEdit({ ...edit, team: e.target.value })}
                      className="admin-input"
                    >
                      <option value="">(sin equipo)</option>
                      {teamOptions.map((t) => (
                        <option key={t.slug} value={t.slug}>
                          {t.name}
                          {!t.visible ? " (oculto)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">País</label>
                    <input
                      value={edit.country}
                      onChange={(e) => setEdit({ ...edit, country: e.target.value })}
                      placeholder="CR"
                      className="admin-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">Equipos por temporada</label>
                  {edit.teams.map((row, i) => (
                    <div key={i} className="mt-2 flex gap-2">
                      <input
                        value={row.year}
                        onChange={(e) => {
                          const teams = [...edit.teams];
                          teams[i] = { ...row, year: e.target.value };
                          setEdit({ ...edit, teams });
                        }}
                        placeholder="2026"
                        className="admin-input w-24"
                      />
                      <select
                        value={row.team}
                        onChange={(e) => {
                          const teams = [...edit.teams];
                          teams[i] = { ...row, team: e.target.value };
                          setEdit({ ...edit, teams });
                        }}
                        className="admin-input flex-1"
                      >
                        <option value="">(sin equipo)</option>
                        {teamOptions.map((t) => (
                          <option key={t.slug} value={t.slug}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setEdit({ ...edit, teams: edit.teams.filter((_, j) => j !== i) })
                        }
                        className="rounded-lg border border-[var(--line)] px-2 text-[var(--text-dim)] hover:text-red-400"
                        aria-label="Quitar temporada"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEdit({ ...edit, teams: [...edit.teams, { year: "", team: "" }] })
                    }
                    className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[#4C8DFF]"
                  >
                    + Agregar temporada
                  </button>
                </div>

                <div>
                  <label className="admin-label">Aliases (coma)</label>
                  <input
                    value={edit.aliases}
                    onChange={(e) => setEdit({ ...edit, aliases: e.target.value })}
                    placeholder="nombre anterior, apodo"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={save}
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
