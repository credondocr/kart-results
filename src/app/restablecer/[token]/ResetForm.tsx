"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  token: string;
  expired: boolean;
}

export default function ResetForm({ token, expired }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (expired) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Link expirado
        </h1>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          Pide un link nuevo desde el login.
        </p>
        <Link href="/olvide-password" className="mt-4 inline-block text-sm font-semibold text-[#4C8DFF]">
          Solicitar otro link
        </Link>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Contraseña actualizada
        </h1>
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3a7cf0]"
        >
          Iniciar sesión
        </Link>
      </Shell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("Mínimo8 caracteres");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
        Nueva contraseña
      </h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Contraseña (mín. 8)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] px-3 py-2.5 text-white outline-none focus:border-[#4C8DFF]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Repetir contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] px-3 py-2.5 text-white outline-none focus:border-[#4C8DFF]"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ink-950)] px-4 pt-20">
      <div className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
          Costa Rica Kart Championship
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
