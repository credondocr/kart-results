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
