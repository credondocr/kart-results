"use client";

import { useState } from "react";

interface Props {
  email: string;
}

export default function ContactActions({ email }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: abre el mailto igual
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
        Email oficial
      </p>
      <p className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
        {email}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={`mailto:${email}?subject=Contacto%20CRKC`}
          className="inline-flex items-center rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
        >
          Escribir correo
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center rounded-lg border border-[var(--line-strong)] px-5 py-3 text-base font-semibold text-white transition-colors hover:border-[#4C8DFF]/60"
        >
          {copied ? "Copiado ✓" : "Copiar email"}
        </button>
      </div>
    </div>
  );
}
