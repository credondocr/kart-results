"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
}

/**
 * Tagline reveal: cada palabra pasa de opaca a blanca al entrar en viewport
 * (IntersectionObserver, sin scroll listeners crudos).
 */
export default function TaglineReveal({ text }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const ref = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          words.forEach((_, i) => {
            setTimeout(() => setActive((n) => Math.max(n, i + 1)), i * 90);
          });
          io.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <p
      ref={ref}
      className="max-w-[16ch] font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:max-w-[22ch] sm:text-5xl lg:text-6xl"
      style={{ textWrap: "balance" }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ opacity: i < active ? 1 : 0.28 }}
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
