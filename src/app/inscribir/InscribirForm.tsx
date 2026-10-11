"use client";

import { useCallback, useEffect, useState } from "react";

interface OpenDate {
  id: number;
  name: string;
  dateLabel: string;
  location: string | null;
  categories: string[];
  priceBase: number | null;
}

interface ExistingReg {
  id: number;
  status: string;
  categories: string[];
  payment_method: string;
  amount_total: number | null;
  rejection_note: string | null;
  race_name: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de verificación",
  verified: "Pago verificado — esperando aprobación",
  approved: "¡Aprobada!",
  rejected: "No aprobada",
};

export default function InscribirForm({ openDate }: { openDate: OpenDate | null }) {
  const [existing, setExisting] = useState<ExistingReg | null>(null);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<string[]>(openDate?.categories ?? []);
  const [payment, setPayment] = useState<"transfer" | "track">("transfer");
  const [transponder, setTransponder] = useState("");
  const [ticket, setTicket] = useState<File | null>(null);
  const [ack, setAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registrations");
      const data = await res.json();
      setExisting(data.registration ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!openDate) {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
          Inscripciones
        </h1>
        <p className="mt-4 text-sm text-[var(--text-dim)]">
          No hay una fecha abierta en este momento. El calendario se publica
          cuando la federation abre inscripciones.
        </p>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-[var(--text-dim)]">Cargando…</p>
      </Shell>
    );
  }

  if (existing) {
    const label = STATUS_LABEL[existing.status] ?? existing.status;
    return (
      <Shell>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
          {openDate.name}
        </h1>
        <p className="mt-1 text-sm capitalize text-[var(--text-dim)]">
          {openDate.dateLabel}
        </p>
        <div
          className={`mt-6 rounded-xl border p-4 text-sm font-semibold ${
            existing.status === "approved"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : existing.status === "rejected"
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          {label}
        </div>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          Categorías: {existing.categories.join(", ")}
        </p>
        {existing.rejection_note ? (
          <p className="mt-2 text-sm text-red-400">
            Motivo: {existing.rejection_note}
          </p>
        ) : null}
        {existing.status === "pending" && existing.payment_method === "transfer" ? (
          <p className="mt-4 text-xs text-[var(--text-dim)]">
            Si ya subiste el ticket, el admin lo revisa y te avisa por correo.
          </p>
        ) : null}
      </Shell>
    );
  }

  const total =
    openDate.priceBase != null ? openDate.priceBase * cats.length : null;

  const toggleCat = (c: string) => {
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cats.length || !ack) return;
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      cats.forEach((c) => fd.append("categories", c));
      fd.set("payment_method", payment);
      fd.set("transponder", transponder);
      fd.set("ack", "true");
      if (ticket) fd.set("ticket", ticket);
      const res = await fetch("/api/registrations", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
        {openDate.name}
      </h1>
      <p className="mt-1 text-sm capitalize text-[var(--text-dim)]">
        {openDate.dateLabel}
        {openDate.location ? ` · ${openDate.location}` : ""}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <fieldset>
          <legend className="admin-label">Categorías (una o más)</legend>
          <div className="grid grid-cols-2 gap-2">
            {openDate.categories.map((c) => (
              <label
                key={c}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  cats.includes(c)
                    ? "border-[#4C8DFF]/60 bg-[#4C8DFF]/10 text-white"
                    : "border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={cats.includes(c)}
                  onChange={() => toggleCat(c)}
                  className="accent-[#4C8DFF]"
                />
                {c}
              </label>
            ))}
          </div>
          {total != null && cats.length > 0 ? (
            <p className="mt-2 font-mono text-sm font-bold tabular-nums text-white">
              Total: ₡{total.toLocaleString("es-CR")}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label className="admin-label" htmlFor="transponder">
            Transponder (opcional)
          </label>
          <input
            id="transponder"
            value={transponder}
            onChange={(e) => setTransponder(e.target.value)}
            className="admin-input font-mono"
            placeholder="Número del transponder"
          />
        </div>

        {total != null && total > 0 ? (
          <fieldset>
            <legend className="admin-label">Pago</legend>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  checked={payment === "transfer"}
                  onChange={() => setPayment("transfer")}
                  className="accent-[#4C8DFF]"
                />
                Transferencia (subir comprobante)
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="radio"
                  checked={payment === "track"}
                  onChange={() => setPayment("track")}
                  className="accent-[#4C8DFF]"
                />
                Pago en pista
              </label>
            </div>
            {payment === "transfer" ? (
              <div className="mt-3">
                <label className="admin-label" htmlFor="ticket">
                  Comprobante (imagen o PDF, máx2.5MB)
                </label>
                <input
                  id="ticket"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setTicket(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[var(--text-dim)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.1em] file:text-white"
                />
              </div>
            ) : null}
          </fieldset>
        ) : null}

        <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-4 text-sm text-[var(--text-dim)]">
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5 accent-[#4C8DFF]"
            required
          />
          <span>
            Acepto participar en esta fecha y declaro que la información
            suministrada es verídica. Asumo la responsabilidad por cualquier
            error u omisión en mi inscripción.
          </span>
        </label>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <button
          type="submit"
          disabled={saving || !cats.length || !ack}
          className="w-full rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Enviando…" : "Enviar inscripción"}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-28">
      <div className="mx-auto max-w-lg px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
