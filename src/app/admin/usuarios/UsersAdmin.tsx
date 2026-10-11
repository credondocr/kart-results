"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface UserRow {
  id: number;
  email: string;
  role: string;
  name: string;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  parent_id: number | null;
  created_at: string;
}

interface PilotHit {
  key: string;
  name: string;
  team: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [pilotKey, setPilotKey] = useState<string | null>(null);
  const [pilotLabel, setPilotLabel] = useState("");
  const [pilotQuery, setPilotQuery] = useState("");
  const [pilotHits, setPilotHits] = useState<PilotHit[]>([]);
  const [parentId, setParentId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!editing || pilotQuery.trim().length < 2 || pilotKey) {
      setPilotHits([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/pilots?q=${encodeURIComponent(pilotQuery)}&limit=8`
        );
        if (!res.ok) return;
        const data = await res.json();
        setPilotHits(data.pilots ?? []);
      } catch {
        setPilotHits([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [pilotQuery, pilotKey, editing]);

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setName(u.name);
    setLicense(u.license_accr ?? "");
    setPilotKey(u.pilot_key);
    setPilotLabel(u.pilot_key ?? "");
    setPilotQuery("");
    setParentId(u.parent_id ? String(u.parent_id) : "");
    setMessage(null);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          license_accr: license || null,
          pilot_key: pilotKey,
          parent_id: parentId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Guardado ✓");
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
              Usuarios
            </h1>
          </div>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <p className="mt-4 max-w-3xl text-xs text-[var(--text-dim)]">
          Cuentas creadas por invitación. Vincula un piloto al registro maestro
          (nombre/equipo/país) para que su inscripción se prellene sola. La
          licencia ACCR debe ser única.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                  <th className="px-4 py-2.5 font-bold">Nombre</th>
                  <th className="px-3 py-2.5 font-bold">Email</th>
                  <th className="px-3 py-2.5 font-bold">Rol</th>
                  <th className="px-3 py-2.5 font-bold">Licencia</th>
                  <th className="px-3 py-2.5 font-bold">Piloto registro</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-dim)]">
                      Cargando…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-dim)]">
                      Sin usuarios.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="cursor-pointer border-t border-[var(--line)] hover:bg-white/[0.03]"
                      onClick={() => openEdit(u)}
                    >
                      <td className="px-4 py-2.5 font-semibold text-white">{u.name}</td>
                      <td className="px-3 py-2.5 text-[var(--text-dim)]">{u.email}</td>
                      <td className="px-3 py-2.5 capitalize">{u.role}</td>
                      <td className="px-3 py-2.5 font-mono text-xs">{u.license_accr ?? "—"}</td>
                      <td className="px-3 py-2.5">
                        {u.pilot_key ? (
                          <span className="rounded-md bg-[#4C8DFF]/15 px-2 py-0.5 text-xs font-semibold text-[#4C8DFF]">
                            {u.pilot_key}
                          </span>
                        ) : u.role === "piloto" ? (
                          <span className="text-xs text-amber-400">sin vincular</span>
                        ) : (
                          "—"
                        )}
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

        {editing ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setEditing(null)}>
            <aside
              className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-950)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Editar usuario
                  </p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    {editing.name}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-dim)]">{editing.email}</p>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Licencia ACCR</label>
                  <input
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="admin-input font-mono"
                  />
                </div>

                {editing.role === "piloto" ? (
                  <div>
                    <label className="admin-label">Tutor / padre (opcional)</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="admin-input"
                    >
                      <option value="">— Sin tutor —</option>
                      {users
                        .filter((u) => u.id !== editing.id)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                      El tutor podrá editar este perfil desde /perfil.
                    </p>
                  </div>
                ) : null}

                {editing.role === "piloto" ? (
                  <div className="relative">
                    <label className="admin-label">Piloto del registro</label>
                    {pilotKey ? (
                      <div className="flex items-center gap-2 rounded-lg border border-[#4C8DFF]/50 bg-[#4C8DFF]/10 px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                          {pilotLabel || pilotKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPilotKey(null);
                            setPilotLabel("");
                            setPilotQuery("");
                          }}
                          className="text-[var(--text-dim)] hover:text-white"
                          aria-label="Desvincular"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          value={pilotQuery}
                          onChange={(e) => setPilotQuery(e.target.value)}
                          placeholder="Buscar por nombre…"
                          className="admin-input"
                        />
                        {pilotHits.length > 0 ? (
                          <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] py-1 shadow-2xl">
                            {pilotHits.map((p) => (
                              <li key={p.key}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPilotKey(p.key);
                                    setPilotLabel(`${p.name}${p.team ? ` (${p.team})` : ""}`);
                                    setPilotHits([]);
                                  }}
                                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-white hover:bg-[#4C8DFF]/20"
                                >
                                  <span className="truncate">{p.name}</span>
                                  <span className="ml-2 font-mono text-[11px] text-[var(--text-dim)]">
                                    {p.team ?? ""}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
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
