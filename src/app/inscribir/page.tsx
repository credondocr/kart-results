import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscripciones | Costa Rica Kart Championship",
  description:
    "Inscripción a la fecha del Costa Rica Kart Championship. Acceso solo por invitación.",
};

export default function InscribirPage() {
  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-28">
      <div className="mx-auto max-w-lg px-4 pb-24 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
            Inscripciones
          </p>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white">
            Formulario pronto
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-dim)]">
            Estamos preparando el sistema de inscripciones por fecha. Cuando
            abra, vas a poder completar tu ficha, elegir categorías y subir tu
            comprobante de pago desde acá.
          </p>
          <p className="mt-3 text-sm text-[var(--text-dim)]">
            ¿Ya recibiste tu invitación? Entra con tu cuenta.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a7cf0]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
