"use client";

import { useEffect, useRef, useState } from "react";
import { useLatinoamericano } from "./LatinoamericanoStore";

function useCountUp(target: number, durationMs = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs]);

  return { ref, value };
}

function Stat({
  target,
  label,
  suffix,
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="flex flex-col items-center gap-1.5 px-2">
      <span
        ref={ref}
        className="font-display text-4xl font-black tabular-nums leading-none text-white sm:text-5xl md:text-6xl"
      >
        {value}
        {suffix ? <span className="text-[#4C8DFF]">{suffix}</span> : null}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
        {label}
      </span>
    </div>
  );
}

/** Contador gigante con count-up: pre-inscritos + países. */
export default function BigCounter() {
  const { submissions, loading } = useLatinoamericano();

  const total = submissions.length;
  const countries = new Set(
    submissions.map((s) => s.nacionalidad).filter(Boolean)
  ).size;
  const hasData = total > 0;

  return (
    <section
      aria-label="Pre-registros"
      className="border-b border-[var(--line)] bg-[var(--surface)]/30"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-center gap-x-10 gap-y-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <Stat target={hasData ? total : 0} label="Pre-inscritos" />
        <div className="hidden h-12 w-px bg-[var(--line)] sm:block" />
        <Stat target={hasData ? countries : 0} label="Países" />
        <div className="hidden h-12 w-px bg-[var(--line)] sm:block" />
        <Stat target={13} label="Categorías" />
        <div className="hidden h-12 w-px bg-[var(--line)] sm:block" />
        <Stat target={4} label="Edición" suffix="ª" />
        {!loading && !hasData ? (
          <p className="w-full text-center text-xs text-[var(--text-dim)]">
            Sé el primero en aparecer en esta lista.
          </p>
        ) : null}
      </div>
    </section>
  );
}
