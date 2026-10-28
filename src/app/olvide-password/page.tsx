"use client";

import { useState } from "react";
import Link from "next/link";

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Revisa tu correo
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">
          Si existe una cuenta con ese email, recibirás un link para crear una
          nueva contraseña (válido por1 hora).
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-[#4C8DFF] hover:opacity-80"
        >
          ← Volver a iniciar sesión
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
        Olvidé mi contraseña
      </h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Escribe tu email y te enviamos un link para restablecerla.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] px-3 py-2.5 text-white outline-none focus:border-[#4C8DFF]"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Enviar link"}
        </button>
      </form>
      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-[var(--text-dim)] hover:text-white"
      >
        ← Volver a iniciar sesión
      </Link>
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
