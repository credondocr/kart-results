"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }
      router.push("/admin/pilots");
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ink-950)] px-4 pt-20">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-8"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
          Kart Results
        </p>
        <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white">
          Admin
        </h1>
        <label
          htmlFor="password"
          className="mt-6 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-dim)]"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] px-3 py-2.5 text-white outline-none focus:border-[#4C8DFF]"
        />
        {error ? (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#3a7cf0] disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
