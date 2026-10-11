"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminNav from "../AdminNav";

interface Dashboard {
  stats: {
    pending: number;
    verified: number;
    approved: number;
    rejected: number;
    track_pending: number;
    total: number;
  };
  nextDates: Array<{
    id: number;
    name: string;
    race_date: string;
    status: string;
    location: string | null;
  }>;
  activeCategories: number;
  userCount: number;
  pendingInvites: number;
  recentRegistrations: Array<{
    id: number;
    status: string;
    payment_method: string;
    created_at: string;
    categories: string[];
    user_name: string;
    race_name: string;
  }>;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  verified: "bg-sky-500/15 text-sky-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[var(--ink-950)] pt-20">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          <AdminNav />
          <p className="mt-10 text-center text-sm text-[var(--text-dim)]">Cargando panel…</p>
        </div>
      </div>
    );
  }

  const { stats, nextDates } = data;
  const openDate = nextDates.find((d) => d.status === "open");
  const attention = stats.pending + data.pendingInvites;

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Panel de administración
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
              Resumen
            </h1>
          </div>
          {attention > 0 ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-400">
              {attention} {attention === 1 ? "pendiente" : "pendientes"}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
              Al día
            </span>
          )}
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        {/* Próxima fecha */}
        {openDate ? (
          <section className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Inscripciones abiertas
                </p>
                <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                  {openDate.name}
                </h2>
                <p className="mt-0.5 text-sm capitalize text-[var(--text-dim)]">
                  {new Date(openDate.race_date).toLocaleDateString("es-CR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  {openDate.location ? ` · ${openDate.location}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/admin/inscripciones"
                  className="rounded-lg bg-[#4C8DFF] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#3a7cf0]"
                >
                  Revisar inscripciones
                </Link>
                <Link
                  href="/admin/fechas"
                  className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:border-[#4C8DFF]/60"
                >
                  Gestionar fecha
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
              Sin fecha abierta
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white">
              Abre una fecha para recibir inscripciones
            </h2>
            <Link
              href="/admin/fechas"
              className="mt-3 inline-block rounded-lg bg-[#4C8DFF] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-[#3a7cf0]"
            >
              Crear fecha
            </Link>
          </section>
        )}

        {/* Métricas */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Aprobadas", stats.approved, "text-emerald-400"],
            ["Verificadas", stats.verified, "text-sky-400"],
            ["Pendientes", stats.pending, "text-amber-400"],
            ["Rechazadas", stats.rejected, "text-red-400"],
            ["Pagan en pista", stats.track_pending, "text-[var(--text-dim)]"],
            ["Total", stats.total, "text-white"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)]">
                {label}
              </p>
              <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            ["Usuarios", data.userCount, "/admin/usuarios"],
            ["Categorías activas", data.activeCategories, "/admin/categorias"],
            ["Invitaciones por vencer", data.pendingInvites, "/admin/invitaciones"],
          ].map(([label, value, href]) => (
            <Link
              key={String(label)}
              href={String(href)}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4 transition-colors hover:border-[#4C8DFF]/50"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)]">
                {label}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
                {value}
              </p>
            </Link>
          ))}
        </div>

        {/* Últimas inscripciones */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
              Últimas inscripciones
            </h2>
            <Link
              href="/admin/inscripciones"
              className="text-sm font-semibold text-[#4C8DFF] hover:opacity-80"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--line)]">
            {data.recentRegistrations.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--text-dim)]">
                Aún no hay inscripciones.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.recentRegistrations.map((r) => (
                    <tr key={r.id} className="border-t border-[var(--line)] first:border-t-0">
                      <td className="px-4 py-2.5 font-semibold text-white">
                        {r.user_name}
                      </td>
                      <td className="hidden px-3 py-2.5 text-xs text-[var(--text-dim)] sm:table-cell">
                        {r.race_name}
                      </td>
                      <td className="hidden px-3 py-2.5 text-xs text-[var(--text-dim)] md:table-cell">
                        {Array.isArray(r.categories) ? r.categories.join(", ") : ""}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            STATUS_BADGE[r.status] ?? ""
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
