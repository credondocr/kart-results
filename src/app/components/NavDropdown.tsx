"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  label: string;
  items: NavItem[];
  active: boolean;
}

/** Dropdown del nav: un solo nivel, cierra con click afuera o Escape. */
export default function NavDropdown({ label, items, active }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const childActive = items.some(
    (item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(item.href)
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex items-center gap-1 text-xs xl:text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
          active || childActive ? "text-white" : "text-[#9BA3BD] hover:text-white"
        }`}
      >
        {label}
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {(active || childActive) && (
          <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#4C8DFF]" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 w-52 rounded-xl border border-white/10 bg-[#0F1322]/95 p-1.5 shadow-2xl backdrop-blur-md">
          {items.map((item) => {
            const current =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  current
                    ? "bg-[#4C8DFF]/15 text-white"
                    : "text-[#9BA3BD] hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
