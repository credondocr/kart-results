"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface Reg {
  id: number;
  status: string;
  categories: string[];
  payment_method: string;
  amount_total: number | null;
  ticket_url: string | null;
  transponder: string | null;
  rejection_note: string | null;
  license_accr: string | null;
  created_at: string;
  race_name: string;
  race_date: string;
  user_name: string;
  user_email: string;
  team_slug: string | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber-500/15 text-amber-400" },
  verified: { label: "Verificada", cls: "bg-sky-500/15 text-sky-400" },
  approved: { label: "Aprobada", cls: "bg-emerald-500/15 text-emerald-400" },
  rejected: { label: "Rechazada", cls: "bg-red-500/15 text-red-400" },
};

export default function AdminInscripcionesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setRows(data.registrations ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: number, action: string, note?: string) => {
    setMessage(null);
    const res = await fetch("/api/admin/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, note }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(`Error: ${data.error ?? res.status}`);
      return;
    }
    setMessage(`Hecho ✓ (${action})`);
    setRejectId(null);
    setRejectNote("");
    await load();
  };

  const metrics = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    track: rows.filter((r) => r.payment_method === "track").length,
  };

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Inscripciones
            </h1>
          </div>
          <a
            href="/api/admin/registrations?csv=1"
            className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-[#4C8DFF]/60"
          >
            Descargar CSV
          </a>
        </div>
        <div className="mt-4">
          <AdminNav />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total", metrics.total],
            ["Pendientes", metrics.pending],
            ["Aprobadas", metrics.approved],
            ["Pagan en pista", metrics.track],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4">
              <p className="stat-label">{label}</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>

        {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)]">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface-2)]/60 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
                  <th className="px-4 py-2.5 font-bold">Piloto</th>
                  <th className="px-3 py-2.5 font-bold">Fecha</th>
                  <th className="px-3 py-2.5 font-bold">Categorías</th>
                  <th className="px-3 py-2.5 font-bold">Pago</th>
                  <th className="px-3 py-2.5 font-bold">Monto</th>
                  <th className="px-3 py-2.5 font-bold">Estado</th>
                  <th className="px-3 py-2.5 font-bold">Acciones</th>
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
                      Sin inscripciones todavía.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const st = STATUS[r.status] ?? { label: r.status, cls: "" };
                    return (
                      <tr key={r.id} className="border-t border-[var(--line)] align-top">
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-white">{r.user_name}</p>
                          <p className="text-xs text-[var(--text-dim)]">{r.user_email}</p>
                          {r.transponder ? (
                            <p className="font-mono text-[11px] text-[var(--text-dim)]">
                              XP {r.transponder}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-[var(--text-dim)]">
                          {r.race_name}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {Array.isArray(r.categories) ? r.categories.join(", ") : ""}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.payment_method === "track" ? "En pista" : "Transferencia"}
                          {r.ticket_url ? (
                            <a
                              href={
                                r.ticket_url.startsWith("tickets/")
                                  ? `/api/admin/tickets/${r.ticket_url}`
                                  : r.ticket_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 block font-semibold text-[#4C8DFF] underline-offset-2 hover:underline"
                            >
                              Ver ticket
                            </a>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">
                          {r.amount_total != null ? `₡${Number(r.amount_total).toLocaleString("es-CR")}` : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${st.cls}`}>
                            {st.label}
                          </span>
                          {r.rejection_note ? (
                            <p className="mt-1 max-w-[140px] text-[11px] text-red-400">
                              {r.rejection_note}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {r.status === "pending" ? (
                              <button
                                onClick={() => act(r.id, "verify")}
                                className="rounded-md border border-[var(--line)] px-2 py-1 text-[10px] font-bold uppercase text-sky-400 hover:border-sky-400/50"
                              >
                                Verificar pago
                              </button>
                            ) : null}
                            {r.status !== "approved" && r.status !== "rejected" ? (
                              <button
                                onClick={() => act(r.id, "approve")}
                                className="rounded-md border border-emerald-500/40 px-2 py-1 text-[10px] font-bold uppercase text-emerald-400 hover:bg-emerald-500/10"
                              >
                                Aprobar
                              </button>
                            ) : null}
                            {r.status !== "rejected" && r.status !== "approved" ? (
                              <button
                                onClick={() => setRejectId(rejectId === r.id ? null : r.id)}
                                className="rounded-md border border-[var(--line)] px-2 py-1 text-[10px] font-bold uppercase text-red-400 hover:border-red-400/50"
                              >
                                Rechazar
                              </button>
                            ) : null}
                          </div>
                          {rejectId === r.id ? (
                            <div className="mt-2">
                              <input
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                placeholder="Motivo (requerido)"
                                className="admin-input text-xs"
                              />
                              <button
                                onClick={() => act(r.id, "reject", rejectNote)}
                                disabled={!rejectNote.trim()}
                                className="mt-1 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white disabled:opacity-50"
                              >
                                Confirmar rechazo
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
