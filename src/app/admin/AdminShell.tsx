"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Operación",
    items: [
      { href: "/admin", label: "Resumen" },
      { href: "/admin/fechas", label: "Fechas" },
      { href: "/admin/inscripciones", label: "Inscripciones" },
    ],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/pilots", label: "Pilotos" },
      { href: "/admin/teams", label: "Equipos" },
      { href: "/admin/categorias", label: "Categorías" },
      { href: "/admin/penalties", label: "Penales" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/invitaciones", label: "Invitaciones" },
      { href: "/admin/usuarios", label: "Usuarios" },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setEmail(d.user?.email ?? null))
      .catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }, [router]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-[var(--ink-950)]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--line)] bg-[#0A0920] lg:flex">
        <div className="flex h-14 items-center border-b border-[var(--line)] px-4">
          <Link href="/admin" className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
            CRKC <span className="text-[#4C8DFF]">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "bg-[#4C8DFF]/15 text-white"
                            : "text-[var(--text-dim)] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-[var(--line)] px-4 py-3">
          {email ? (
            <p className="truncate text-xs text-[var(--text-dim)]" title={email}>
              {email}
            </p>
          ) : null}
          <div className="mt-2 flex items-center justify-between">
            <Link href="/" className="text-xs font-semibold text-[#4C8DFF] hover:opacity-80">
              Ver sitio
            </Link>
            <button
              onClick={logout}
              className="text-xs font-semibold text-[var(--text-dim)] hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar móvil */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[#0A0920]/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
          CRKC <span className="text-[#4C8DFF]">Admin</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase text-white"
          aria-expanded={open}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/* Drawer móvil */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <nav
            className="absolute inset-y-14 left-0 w-64 overflow-y-auto border-r border-[var(--line)] bg-[#0A0920] p-4"
            onClick={(e) => e.stopPropagation()}
            aria-label="Admin móvil"
          >
            {SECTIONS.map((section) => (
              <div key={section.title} className="mb-4">
                <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive(item.href)
                        ? "bg-[#4C8DFF]/15 text-white"
                        : "text-[var(--text-dim)] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="border-t border-[var(--line)] pt-3">
              <Link href="/" className="block px-2 py-1 text-sm text-[#4C8DFF]">
                Ver sitio
              </Link>
              <button onClick={logout} className="block px-2 py-1 text-sm text-[var(--text-dim)]">
                Salir
              </button>
            </div>
          </nav>
        </div>
      ) : null}

      {/* Contenido */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 lg:pl-60">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
