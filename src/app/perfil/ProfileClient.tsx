"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findPilotPhoto } from "@/app/utils/pilotPhotos";

interface Profile {
  id: number;
  email: string;
  name: string;
  role: string;
  license_accr: string | null;
  team_slug: string | null;
  pilot_key: string | null;
  bio: string | null;
  parent_id: number | null;
}

interface Team {
  slug: string;
  name: string;
  visible?: boolean;
}

export default function ProfileClient() {
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Profile[]>([]);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [bio, setBio] = useState("");
  const [license, setLicense] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passSaving, setPassSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profRes, teamsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/teams"),
      ]);
      if (profRes.status === 401) {
        router.push("/login");
        return;
      }
      const prof = await profRes.json();
      setMe(prof.user);
      setChildren(prof.children ?? []);
      if (teamsRes.ok) {
        const t = await teamsRes.json();
        setTeams(
          (t.teams ?? []).map((x: { slug: string; name: string }) => ({
            slug: x.slug,
            name: x.name,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const current: Profile | null =
    me && viewingId === null ? me : children.find((c) => c.id === viewingId) ?? me;

  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setTeamSlug(current.team_slug ?? "");
    setBio(current.bio ?? "");
    setLicense(current.license_accr ?? "");
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !me || !current) {
    return (
      <div className="min-h-screen bg-[var(--ink-950)] pt-28">
        <p className="text-center text-sm text-[var(--text-dim)]">Cargando perfil…</p>
      </div>
    );
  }

  const isOwn = current.id === me.id;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: current.id,
          name,
          team_slug: teamSlug || null,
          bio,
          license_accr: license || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Perfil guardado ✓");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const changePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSaving(true);
    setPassMsg(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: curPass, next: newPass }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPassMsg(`Error: ${data.error ?? res.status}`);
        return;
      }
      setPassMsg("Contraseña actualizada ✓");
      setCurPass("");
      setNewPass("");
    } finally {
      setPassSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const photoSrc = current
    ? findPilotPhoto(current.pilot_key?.replace(/-/g, " ") ?? current.name)
    : null;

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-lg px-4 pb-24 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
            >
              ← Inicio
            </Link>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
              Mi perfil
            </h1>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-dim)] hover:text-white"
          >
            Salir
          </button>
        </div>

        {/* Foto del piloto */}
        <div className="mt-6 flex flex-col items-center">
          {photoSrc ? (
            <div className="relative h-36 w-36 overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-2)] shadow-2xl sm:h-40 sm:w-40">
              <Image
                src={photoSrc}
                alt={current?.name ?? "Foto del piloto"}
                fill
                sizes="160px"
                className="object-cover object-top"
                priority
              />
            </div>
          ) : (
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/40 sm:h-40 sm:w-40">
              <span className="font-display text-4xl font-black text-[var(--text-dim)]">
                #
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Sin foto
              </span>
            </div>
          )}
          <p className="mt-3 max-w-xs text-center text-[11px] leading-relaxed text-[var(--text-dim)]">
            {photoSrc
              ? "La foto se gestiona con ACEK."
              : "¿Quieres tu foto de piloto? Coordiná con ACEK para que sea tomada en el paddock."}
          </p>
        </div>

        {children.length > 0 ? (
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4">
            <label className="admin-label">Viendo perfil de</label>
            <select
              value={viewingId ?? ""}
              onChange={(e) => setViewingId(e.target.value ? Number(e.target.value) : null)}
              className="admin-input"
            >
              <option value="">{me.name} (yo)</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (hijo/a)
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-[var(--text-dim)]">
              Como tutor puedes editar el perfil de tus hijos. La contraseña
              siempre es la de tu propia cuenta.
            </p>
          </div>
        ) : null}

        <form onSubmit={save} className="mt-6 space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
              {isOwn ? "Tu ficha" : `Ficha de ${current.name}`}
            </p>
            <p className="truncate text-[11px] text-[var(--text-dim)]">{current.email}</p>
          </div>

          <div>
            <label className="admin-label">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">Equipo</label>
              <select
                value={teamSlug}
                onChange={(e) => setTeamSlug(e.target.value)}
                className="admin-input"
              >
                <option value="">(sin equipo)</option>
                {teams.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
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
          </div>

          <div>
            <label className="admin-label">Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Contanos algo del piloto…"
              className="admin-input resize-y"
            />
            <p className="mt-1 text-right font-mono text-[10px] text-[var(--text-dim)]">
              {bio.length}/1000
            </p>
          </div>

          {message ? (
            <p
              className={`text-sm ${
                message.startsWith("Error") ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {message}
            </p>
          ) : null}

          <p className="text-[11px] leading-relaxed text-[var(--text-dim)]">
            Los cambios de equipo se publican en el sitio público en el próximo
            deploy. Tu ficha siempre muestra tu información actual.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a7cf0] disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar perfil"}
          </button>
        </form>

        {isOwn ? (
          <form
            onSubmit={changePass}
            className="mt-6 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
              Cambiar contraseña
            </p>
            <div>
              <label className="admin-label">Contraseña actual</label>
              <input
                type="password"
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                className="admin-input"
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="admin-label">Nueva contraseña (mín. 8)</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="admin-input"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {passMsg ? (
              <p
                className={`text-sm ${
                  passMsg.startsWith("Error") ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {passMsg}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={passSaving}
              className="w-full rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-white hover:border-[#4C8DFF]/60 disabled:opacity-50"
            >
              {passSaving ? "Actualizando…" : "Actualizar contraseña"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
