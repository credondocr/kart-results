"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/pilots", label: "Pilotos" },
  { href: "/admin/teams", label: "Equipos" },
  { href: "/admin/penalties", label: "Penales" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-[var(--line)]" aria-label="Secciones admin">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
              active
                ? "border-b-2 border-[#4C8DFF] text-white"
                : "border-b-2 border-transparent text-[var(--text-dim)] hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
