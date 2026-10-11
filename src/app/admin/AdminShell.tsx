"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  hint?: string;
}

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Operación",
    items: [
      { href: "/admin", label: "Resumen", hint: "Estado del día" },
      { href: "/admin/fechas", label: "Fechas", hint: "Abrir/cerrar inscripciones" },
      { href: "/admin/inscripciones", label: "Inscripciones", hint: "Validar y aprobar" },
      { href: "/admin/noticias", label: "Noticias", hint: "Publicar contenido" },
      { href: "/admin/media", label: "Media", hint: "Biblioteca de imágenes" },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/pilots", label: "Pilotos" },
      { href: "/admin/teams", label: "Equipos" },
      { href: "/admin/categorias", label: "Categorías" },
      { href: "/admin/penalties", label: "Penales", hint: "Histórico 2019-2023" },
    ],
  },
  {
    title: "Acceso",
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--line)] bg-[#080B16] lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-[var(--line)] px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4C8DFF]/15 font-display text-sm font-black text-[#4C8DFF]">
            K
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
              Kart Results
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
              Administración
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Panel de administración">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex flex-col rounded-lg px-3 py-2 transition-colors ${
                          active
                            ? "bg-[#4C8DFF]/12 text-white"
                            : "text-[var(--text-dim)] hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {active ? (
                          <span
                            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#4C8DFF]"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="text-[13px] font-semibold">{item.label}</span>
                        {item.hint ? (
                          <span className="mt-0.5 text-[10px] font-normal text-[var(--text-dim)] opacity-80">
                            {item.hint}
                          </span>
                        ) : null}
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
            <p className="truncate text-[11px] text-[var(--text-dim)]" title={email}>
              {email}
            </p>
          ) : null}
          <div className="mt-2 flex items-center justify-between">
            <Link
              href="/"
              className="text-[11px] font-semibold text-[#4C8DFF] transition-opacity hover:opacity-80"
            >
              ← Ver sitio
            </Link>
            <button
              onClick={logout}
              className="text-[11px] font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar móvil */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[#080B16]/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4C8DFF]/15 font-display text-xs font-black text-[#4C8DFF]">
            K
          </span>
          <span className="font-display text-sm font-extrabold uppercase tracking-tight text-white">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:border-[#4C8DFF]/50"
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
            className="absolute inset-y-14 left-0 w-72 overflow-y-auto border-r border-[var(--line)] bg-[#080B16] p-4"
            onClick={(e) => e.stopPropagation()}
            aria-label="Admin móvil"
          >
            {SECTIONS.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                      isActive(item.href)
                        ? "bg-[#4C8DFF]/12 text-white"
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
                ← Ver sitio
              </Link>
              <button onClick={logout} className="block px-2 py-1 text-sm text-[var(--text-dim)]">
                Salir
              </button>
            </div>
          </nav>
        </div>
      ) : null}

      {/* Contenido */}
      <main className="min-w-0 flex-1 pt-14 lg:pt-0 lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
