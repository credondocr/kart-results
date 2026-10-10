"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface TeamRow {
  slug: string;
  name: string;
  visible: boolean;
  has_logo: boolean;
  pilot_count?: number;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AdminTeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamRow | "new" | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [visible, setVisible] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setTeams(data.teams ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing("new");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setVisible(true);
    setLogoFile(null);
    setLogoPreview(null);
    setMessage(null);
  };

  const openEdit = (t: TeamRow) => {
    setEditing(t);
    setName(t.name);
    setSlug(t.slug);
    setSlugTouched(true);
    setVisible(t.visible);
    setLogoFile(null);
    setLogoPreview(t.has_logo ? `/logos/${t.slug}.png?t=${Date.now()}` : null);
    setMessage(null);
  };

  const close = () => setEditing(null);

  const onLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const save = async () => {
    if (!editing || !name.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("name", name.trim());
      form.set("slug", slug.trim() || slugify(name));
      form.set("visible", String(visible));
      if (logoFile) form.set("logo", logoFile);

      const url =
        editing === "new"
          ? "/api/admin/teams"
          : `/api/admin/teams/${encodeURIComponent(editing.slug)}`;
      const res = await fetch(url, {
        method: editing === "new" ? "POST" : "PUT",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Guardado ✓ (se publica en el próximo deploy)");
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const logoSrc = (t: TeamRow) =>
    t.has_logo ? `/logos/${t.slug}.png?v=${t.slug}` : "/logos/independiente.png";

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Equipos
            </h1>
          </div>
          <button
            onClick={openNew}
            className="rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0]"
          >
            + Nuevo equipo
          </button>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <p className="mt-4 text-xs text-[var(--text-dim)]">
          El logo se convierte a PNG (512px) y se sirve desde{" "}
          <code className="text-[#4C8DFF]">/logos/{"{slug}"}.png</code> en el
          próximo deploy. Al editar un piloto en la pestaña Pilotos solo puedes
          asignar equipos de esta lista.
        </p>

        {message && !editing ? (
          <p className="mt-3 text-sm text-emerald-400">{message}</p>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="col-span-full py-10 text-center text-sm text-[var(--text-dim)]">
              Cargando…
            </p>
          ) : (
            teams.map((t) => (
              <button
                key={t.slug}
                onClick={() => openEdit(t)}
                className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-4 text-left transition-colors hover:border-[#4C8DFF]/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc(t)}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-extrabold uppercase tracking-tight text-white">
                    {t.name}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-dim)]">
                    {t.slug}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
                    {t.pilot_count ?? 0} pilotos
                    {!t.visible ? " · oculto" : ""}
                    {t.has_logo ? "" : " · sin logo propio"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {editing ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={close}>
            <aside
              className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-950)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    {editing === "new" ? "Nuevo equipo" : "Editar equipo"}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    {name || "—"}
                  </h2>
                </div>
                <button
                  onClick={close}
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
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                    className="admin-input"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="admin-label">Slug (identificador URL)</label>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugTouched(true);
                    }}
                    className="admin-input font-mono"
                    disabled={editing !== "new"}
                  />
                  {editing !== "new" ? (
                    <p className="mt-1 text-[11px] text-[var(--text-dim)]">
                      El slug no se puede cambiar (los pilotos lo referencian).
                    </p>
                  ) : null}
                </div>
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                  />
                  Visible en /equipos y búsqueda
                </label>
                <div>
                  <label className="admin-label">Logo (png/jpg/webp, máx 1.5MB)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-[var(--text-dim)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.1em] file:text-white"
                  />
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Vista previa del logo"
                      className="mt-3 h-24 w-24 object-contain"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || !name.trim()}
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
