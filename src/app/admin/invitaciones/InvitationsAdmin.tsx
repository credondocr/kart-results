"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface InviteRow {
  id: number;
  email: string;
  role: string;
  name: string | null;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  status: "pending" | "accepted" | "expired";
}

interface PilotHit {
  key: string;
  name: string;
  team: string | null;
}

const TEAMS = [
  { slug: "fsa", name: "FIK Sport Academy" },
  { slug: "fmv", name: "FMV Racing" },
  { slug: "advanced", name: "Advanced Karting" },
  { slug: "valerio", name: "Valerio Racing System" },
  { slug: "mhkarting", name: "MH Karting" },
  { slug: "formula", name: "Formula Kart" },
  { slug: "losprimos", name: "Babyliss Pro - MMR" },
  { slug: "dr-racing", name: "DR Racing" },
  { slug: "independiente", name: "Independiente" },
];

export default function AdminInvitationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("piloto");
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [team, setTeam] = useState("");
  const [pilotQuery, setPilotQuery] = useState("");
  const [pilotHits, setPilotHits] = useState<PilotHit[]>([]);
  const [pilotKey, setPilotKey] = useState<string | null>(null);
  const [pilotLabel, setPilotLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invitations");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setRows(data.invitations ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (role !== "piloto" || pilotQuery.trim().length < 2 || pilotKey) {
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
  }, [pilotQuery, pilotKey, role]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setLastUrl(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          name: name || null,
          license_accr: license || null,
          team_slug: team || null,
          pilot_key: pilotKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setLastUrl(data.inviteUrl);
      setMessage(
        data.emailed
          ? "Invitación creada ✓ — email enviado (válido7 días)"
          : "Invitación creada ✓ — el email no se pudo enviar; copia el link y envíalo tú (válido7 días)"
      );
      setEmail("");
      setName("");
      setLicense("");
      setPilotKey(null);
      setPilotLabel("");
      setPilotQuery("");
      setPilotHits([]);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!lastUrl) return;
    await navigator.clipboard.writeText(lastUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revoke = async (id: number) => {
    if (!confirm("¿Revocar esta invitación?")) return;
    const res = await fetch(`/api/admin/invitations/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  const statusLabel: Record<InviteRow["status"], string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    expired: "Expirada",
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
              Invitaciones
            </h1>
          </div>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <p className="mt-4 max-w-3xl text-xs text-[var(--text-dim)]">
          El registro no es público: solo quien reciba una invitación puede
          crear cuenta (piloto o mecánico). El link es de un solo uso y dura{" "}
          <strong>7 días</strong>. Si no tienen correo a la mano, crea la
          invitación igual y envía el link por WhatsApp.
        </p>

        <form
          onSubmit={create}
          className="mt-6 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4 sm:grid-cols-6"
        >
          <div className="sm:col-span-2">
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-input"
              placeholder="piloto@ejemplo.com"
            />
          </div>
          <div>
            <label className="admin-label">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="admin-input">
              <option value="piloto">Piloto</option>
              <option value="mecanico">Mecánico</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="admin-label">Licencia ACCR</label>
            <input
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="admin-input font-mono"
              placeholder="000000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Equipo (opcional)</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="admin-input">
              <option value="">—</option>
              {TEAMS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {role === "piloto" ? (
            <div className="relative sm:col-span-4">
              <label className="admin-label">Piloto del registro (vincula la ficha)</label>
              {pilotKey ? (
                <div className="flex items-center gap-2 rounded-lg border border-[#4C8DFF]/50 bg-[#4C8DFF]/10 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {pilotLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPilotKey(null);
                      setPilotLabel("");
                      setPilotQuery("");
                    }}
                    className="text-[var(--text-dim)] hover:text-white"
                    aria-label="Quitar piloto"
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
                              if (!name) setName(p.name);
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
              <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                Opcional: si el piloto ya existe en el registro, vincúlalo para
                prellenar equipo/historial en la inscripción.
              </p>
            </div>
          ) : null}
          <div className="flex items-end sm:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
            >
              {saving ? "Creando…" : "Crear invitación"}
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
          {lastUrl ? (
            <div className="sm:col-span-6 flex flex-wrap items-center gap-2 rounded-lg border border-[#4C8DFF]/40 bg-[#4C8DFF]/10 p-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-white">
                {lastUrl}
              </code>
              <button
                type="button"
                onClick={copy}
                className="rounded-lg bg-[#4C8DFF] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white"
              >
                {copied ? "Copiado ✓" : "Copiar link"}
              </button>
            </div>
          ) : null}
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                <th className="px-4 py-2.5 font-bold">Email</th>
                <th className="px-3 py-2.5 font-bold">Rol</th>
                <th className="px-3 py-2.5 font-bold">Nombre</th>
                <th className="px-3 py-2.5 font-bold">Licencia</th>
                <th className="px-3 py-2.5 font-bold">Estado</th>
                <th className="px-3 py-2.5 font-bold">Expira</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-dim)]">
                    Sin invitaciones todavía.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-2 font-semibold text-white">{r.email}</td>
                    <td className="px-3 py-2 capitalize">{r.role}</td>
                    <td className="px-3 py-2 text-[var(--text-dim)]">{r.name ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.license_accr ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                          r.status === "accepted"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : r.status === "pending"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-white/5 text-[var(--text-dim)]"
                        }`}
                      >
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-[var(--text-dim)]">
                      {new Date(r.expires_at).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => revoke(r.id)}
                          className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-red-400"
                        >
                          Revocar
                        </button>
                      ) : null}
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
