"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TipTapEditor from "./TipTapEditor";

interface NewsRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  tag: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  cover_image: string | null;
}

interface Draft {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  tag: string;
  content: string;
  status: string;
  scheduled_at: string;
  cover_image: string;
}

const EMPTY: Draft = {
  id: null, title: "", slug: "", excerpt: "", tag: "",
  content: "", status: "draft", scheduled_at: "", cover_image: "",
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-white/10 text-[var(--text-dim)]",
  published: "bg-emerald-500/15 text-emerald-400",
  scheduled: "bg-sky-500/15 text-sky-400",
};

export default function AdminNoticiasPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setNews(data.news ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setMessage(null);
  };

  const openEdit = (n: NewsRow) => {
    fetch(`/api/admin/news/${n.id}`)
      .then((r) => r.json())
      .then((d) => {
        const n2 = d.news;
        setEditing({
          id: n2.id, title: n2.title, slug: n2.slug,
          excerpt: n2.excerpt ?? "", tag: n2.tag ?? "",
          content: n2.content ?? "", status: n2.status,
          scheduled_at: n2.scheduled_at ? n2.scheduled_at.slice(0, 16) : "",
          cover_image: n2.cover_image ?? "",
        });
        setMessage(null);
      });
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const url = editing.id ? `/api/admin/news/${editing.id}` : "/api/admin/news";
      const method = editing.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Guardada ✓");
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("¿Borrar esta noticia?")) return;
    await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
    await load();
  };

  const statusOf = (n: NewsRow) =>
    n.status === "published" && n.scheduled_at && new Date(n.scheduled_at) > new Date()
      ? "scheduled"
      : n.status;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
            Panel de administración
          </p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
            Noticias
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.open("/api/admin/news?csv=1", "_blank")}
            className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white hover:border-[#4C8DFF]/60"
          >
            CSV
          </button>
          <button
            onClick={openNew}
            className="rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0]"
          >
            + Nueva
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
              <th className="px-4 py-2.5 font-bold">Título</th>
              <th className="px-3 py-2.5 font-bold">Tag</th>
              <th className="px-3 py-2.5 font-bold">Estado</th>
              <th className="px-3 py-2.5 font-bold">Publicada</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-dim)]">Cargando…</td></tr>
            ) : news.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--text-dim)]">Sin noticias todavía.</td></tr>
            ) : (
              news.map((n) => {
                const st = statusOf(n);
                return (
                  <tr key={n.id} className="cursor-pointer border-t border-[var(--line)] hover:bg-white/[0.03]" onClick={() => openEdit(n)}>
                    <td className="px-4 py-2.5 font-semibold text-white">{n.title}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-dim)]">{n.tag ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[st] ?? ""}`}>
                        {st === "scheduled" ? "Programada" : st === "published" ? "Publicada" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[var(--text-dim)]">
                      {n.published_at ? new Date(n.published_at).toLocaleDateString("es-CR") : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); remove(n.id); }} className="text-xs font-bold uppercase text-[var(--text-dim)] hover:text-red-400">
                        Borrar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor drawer */}
      {editing ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setEditing(null)}>
          <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--line)] bg-[var(--ink-950)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                {editing.id ? "Editar noticia" : "Nueva noticia"}
              </h2>
              <button onClick={() => setEditing(null)} className="text-2xl text-[var(--text-dim)] hover:text-white">×</button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="admin-label">Título</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="admin-input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Slug (URL)</label>
                  <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="admin-input font-mono text-xs" placeholder="auto" />
                </div>
                <div>
                  <label className="admin-label">Tag / Categoría</label>
                  <input value={editing.tag} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} className="admin-input" placeholder="Campeonato, Inscripciones…" />
                </div>
              </div>
              <div>
                <label className="admin-label">Extracto (aparece en el listado)</label>
                <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} maxLength={300} className="admin-input resize-y" />
              </div>
              <div>
                <label className="admin-label">Imagen de portada (URL)</label>
                <input value={editing.cover_image} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} className="admin-input" placeholder="https://…" />
              </div>

              <div>
                <label className="admin-label">Contenido</label>
                <TipTapEditor content={editing.content} onChange={(html) => setEditing((d) => d ? { ...d, content: html } : d)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Estado</label>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="admin-input">
                    <option value="draft">Borrador</option>
                    <option value="published">Publicada</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Programar publicación</label>
                  <input type="datetime-local" value={editing.scheduled_at} onChange={(e) => setEditing({ ...editing, scheduled_at: e.target.value })} className="admin-input" />
                  <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                    Si defines fecha futura y estado &quot;Publicada&quot;, se publica sola.
                  </p>
                </div>
              </div>
            </div>

            {message ? (
              <p className={`mt-4 text-sm ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button onClick={save} disabled={saving || !editing.title.trim()} className="rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
              <button onClick={() => setEditing(null)} className="rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-white">
                Cancelar
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
