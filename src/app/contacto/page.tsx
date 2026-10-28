import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import ContactActions from "./ContactActions";

export const metadata: Metadata = {
  title: "Contacto | Costa Rica Kart Championship",
  description:
    "Contacta a la ACEK — Asociación de Corredores de Kartismo de Costa Rica.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-lg px-4 pb-24 sm:px-6">
        <Breadcrumb />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
          ACEK
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Contacto
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-dim)]">
          ¿Dudas sobre inscripciones, licencias o el calendario? Escríbenos y
          te respondemos lo antes posible.
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6">
          <ContactActions email="info@acekcr.com" />
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/30 p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
            Redes sociales
          </h2>
          <div className="mt-4 flex items-center gap-3">
            {[
              {
                href: "https://www.youtube.com/channel/UC6yXqyJ5ms7XfxaIpgZ0TFg",
                label: "YouTube",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
                  </svg>
                ),
              },
              {
                href: "https://www.instagram.com/acekeskartismo/",
                label: "Instagram",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                ),
              },
              {
                href: "https://www.facebook.com/ACEKCR/",
                label: "Facebook",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`ACEK en ${s.label}`}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-dim)] transition-colors hover:border-[#4C8DFF]/60 hover:text-white"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/30 p-6">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
            Otras formas
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-dim)]">
            <li>
              <span className="font-semibold text-white">Transmisiones:</span>{" "}
              <a
                href="https://www.youtube.com/@teleredtelevision5270"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4C8DFF] hover:opacity-80"
              >
                Telered en YouTube
              </a>
            </li>
            <li>
              <span className="font-semibold text-white">Inscripciones:</span>{" "}
              <Link href="/inscribir" className="text-[#4C8DFF] hover:opacity-80">
                desde tu perfil
              </Link>
            </li>
            <li>
              <span className="font-semibold text-white">Reglamento:</span>{" "}
              <Link href="/reglamento" className="text-[#4C8DFF] hover:opacity-80">
                ver aquí
              </Link>
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 block text-center text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
