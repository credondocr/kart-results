interface Props {
  items: string[];
}

/** Marquee de categorías (una sola por página, CSS puro). */
export default function CategoryMarquee({ items }: Props) {
  const row = [...items, ...items];
  return (
    <div
      className="landing-marquee overflow-hidden border-y border-[var(--line)] bg-[var(--surface-2)]/30 py-3"
      aria-hidden="true"
    >
      <div className="landing-marquee-track flex w-max gap-10">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 font-display text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]"
          >
            {item}
            <span className="inline-block h-1 w-1 rounded-full bg-[#4C8DFF]" />
          </span>
        ))}
      </div>
    </div>
  );
}
