import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/landing/Reveal";
import LatinoamericanoStore from "./LatinoamericanoStore";
import LiveTicker from "./LiveTicker";
import BigCounter from "./BigCounter";
import HeroCountdown from "./HeroCountdown";
import CategoryMeters from "./CategoryMeters";
import CountryWall from "./CountryWall";
import PreInscritosList from "./PreInscritosList";
import PreRegistroForm from "./PreRegistroForm";
import { EVENT, TODAS_CATEGORIAS } from "./data";

export const metadata: Metadata = {
  title: "Latinoamericano de Karting 2027 — IV Edición",
  description:
    "Campeonato Latinoamericano de Karting 2027, 4ta edición: 7, 8 y 9 de mayo en el P1 Speedway, Costa Rica. Pre-regístrate y asegura tu lugar en la parrilla.",
  openGraph: {
    title: "Latinoamericano de Karting 2027 — IV Edición",
    description:
      "7 – 9 de mayo · P1 Speedway, Costa Rica. Pre-regístrate para el campeonato latinoamericano de karting.",
    images: [
      {
        url: "/media/eventos/latinoamericano-og.jpeg",
        width: 1200,
        height: 2133,
        alt: "Campeonato Latinoamericano de Karting 2027 — IV Edición",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latinoamericano de Karting 2027 — IV Edición",
    description:
      "7 – 9 de mayo · P1 Speedway, Costa Rica. Pre-regístrate para el campeonato latinoamericano de karting.",
    images: ["/media/eventos/latinoamericano-og.jpeg"],
  },
};

const CRONOGRAMA = [
  {
    day: "Viernes",
    date: "7",
    items: [
      "Entrenamientos libres",
      "Escrutinio técnico",
      "Junta de pilotos (briefing obligatorio)",
    ],
  },
  {
    day: "Sábado",
    date: "8",
    items: ["Clasificatorias", "Primer bloque de finales"],
  },
  {
    day: "Domingo",
    date: "9",
    items: ["Finales", "Ceremonia de premiación"],
  },
];

const SPONSORS = [
  "Vortex Engines",
  "ROK Cup",
  "Levanto Kart Tire",
  "ACEK",
  "FENAUTO Deportes",
  "Automóvil Club de CR",
  "FIA Member",
];

export default function LatinoamericanoPage() {
  return (
    <LatinoamericanoStore>
      <div className="bg-[var(--ink-950)] text-[var(--text)]">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src={EVENT.poster}
              alt=""
              fill
              priority
              className="object-cover object-top opacity-30"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink-950)] via-[var(--ink-950)]/90 to-[var(--ink-950)]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink-950)] via-transparent to-[var(--ink-950)]/60" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-24 lg:pt-32">
            <div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8B84B]">
                <span>IV Edición</span>
                <span className="h-1 w-1 rounded-full bg-[#E8B84B]/60" aria-hidden="true" />
                <span>Costa Rica 2027</span>
              </p>
              <h1 className="mt-4 font-display font-black uppercase leading-[0.92] tracking-tight text-white">
                <span className="block text-3xl sm:text-5xl lg:text-6xl">
                  Campeonato
                </span>
                <span className="block text-[clamp(1.9rem,9.5vw,4.5rem)] text-[#4C8DFF]">
                  Latinoamericano
                </span>
                <span className="block text-xl sm:text-3xl lg:text-4xl text-[var(--text-dim)]">
                  de Karting 2027
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-dim)] sm:text-lg">
                Del <span className="font-semibold text-white">{EVENT.datesShort}</span> en el{" "}
                <span className="font-semibold text-white">{EVENT.circuit}</span>, Costa Rica.
                La mejor parrilla latinoamericana, una sola bandera.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#pre-registro"
                  className="rounded-lg bg-[#4C8DFF] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#3a7cf0] active:scale-[0.98]"
                >
                  Pre-inscribirme
                </a>
                <a
                  href={EVENT.reglamentoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[var(--line-strong)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#4C8DFF]/60 hover:bg-white/5"
                >
                  Ver reglamento
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                <HeroCountdown />
              </div>
            </div>
          </div>
        </section>

        {/* ── Ticker + contadores ──────────────────────────────────────── */}
        <LiveTicker />
        <BigCounter />

        {/* ── El evento ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                  Una región,
                  <br />
                  un solo campeonato
                </h2>
                <p className="mt-5 max-w-[65ch] leading-relaxed text-[var(--text-dim)]">
                  El Latinoamericano de Karting reúne a pilotos de todo el continente
                  en Costa Rica por su cuarta edición consecutiva. Tres días de
                  competencia en el P1 Speedway, con las categorías Rok, Tillotson
                  y VLR en una sola parrilla.
                </p>
                <p className="mt-4 max-w-[65ch] leading-relaxed text-[var(--text-dim)]">
                  Pre-regístrate ahora y asegura tu lugar antes de que se abran las
                  inscripciones formales.
                </p>
              </div>
              <div className="relative mx-auto aspect-[1125/2000] w-full max-w-[360px] overflow-hidden rounded-2xl border border-[var(--line)] shadow-xl shadow-black/30">
                <Image
                  src={EVENT.poster}
                  alt="Póster del Campeonato Latinoamericano de Karting 2027"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 360px, 50vw"
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Categorías ───────────────────────────────────────────────── */}
        <section className="border-y border-[var(--line)] bg-[var(--surface)]/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                13 categorías
              </h2>
              <p className="mt-3 max-w-[65ch] text-[var(--text-dim)]">
                Desde Kid Kart hasta Rok Shifter Master: hay parrilla para cada
                nivel.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Iniciación", items: ["Kid Kart", "Stars of Tomorrow"], accent: false },
                  { label: "Rok", items: ["Micro Rok", "Mini Rok", "Rok Shifter", "Rok Shifter Master"], accent: true },
                  { label: "Tillotson", items: ["Tillotson Junior", "Tillotson Senior", "Tillotson Heavy", "Tilli Mini"], accent: false },
                  { label: "VLR", items: ["VLR- Junior", "VLR- Senior", "VLR- Master"], accent: false },
                ].map((fam) => (
                  <div
                    key={fam.label}
                    className={`rounded-2xl border p-5 ${
                      fam.accent
                        ? "border-[#4C8DFF]/30 bg-[#4C8DFF]/[0.06]"
                        : "border-[var(--line)] bg-[var(--surface-2)]/40"
                    }`}
                  >
                    <h3
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        fam.accent ? "text-[#4C8DFF]" : "text-[#E8B84B]"
                      }`}
                    >
                      {fam.label}
                    </h3>
                    <ul className="mt-3 space-y-1.5">
                      {fam.items.map((c) => (
                        <li key={c} className="text-sm font-medium text-white">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
                {TODAS_CATEGORIAS.length} categorías · Vortex &amp; Tillotson
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Sede ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                  P1 Speedway
                </h2>
                <p className="mt-4 text-[var(--text-dim)]">
                  {EVENT.location}
                </p>
                <p className="mt-4 max-w-[65ch] leading-relaxed text-[var(--text-dim)]">
                  Un trazado técnico que premia la constancia y el trabajo en equipo.
                  Paddock amplio, graderías y toda la infraestructura para recibir a
                  pilotos de toda la región.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={EVENT.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#4C8DFF] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#3a7cf0] active:scale-[0.98]"
                  >
                    Google Maps
                  </a>
                  <a
                    href={EVENT.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#4C8DFF]/60 hover:bg-white/5"
                  >
                    Waze
                  </a>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
                <iframe
                  title="Ubicación del P1 Speedway en Google Maps"
                  src={EVENT.mapEmbed}
                  className="h-[360px] w-full lg:h-[420px]"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Cronograma ───────────────────────────────────────────────── */}
        <section className="border-y border-[var(--line)] bg-[var(--surface)]/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Fin de semana de carreras
              </h2>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {CRONOGRAMA.map((d) => (
                  <div
                    key={d.day}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-5xl font-black leading-none text-[#4C8DFF] tabular-nums">
                        {d.date}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                          {d.day}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                          Mayo 2027
                        </p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-2">
                      {d.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-dim)]">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E8B84B]" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Pre-registro ─────────────────────────────────────────────── */}
        <section id="pre-registro" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Asegurá tu lugar
              </h2>
              <p className="mt-3 max-w-[55ch] mx-auto text-[var(--text-dim)]">
                El pre-registro es gratuito y no compromete tu inscripción formal.
                Completa los datos y aparecé en la parrilla de abajo.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl">
              <PreRegistroForm />
            </div>
          </Reveal>
        </section>

        {/* ── Pre-inscritos ────────────────────────────────────────────── */}
        <section
          id="pre-inscritos"
          className="scroll-mt-20 border-t border-[var(--line)] bg-[var(--surface)]/20"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <Reveal>
              <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
                <div>
                  <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                    La parrilla crece
                  </h2>
                  <p className="mt-3 max-w-[55ch] text-[var(--text-dim)]">
                    Países que ya tienen un piloto en la lista del Latinoamericano.
                  </p>
                  <div className="mt-8">
                    <CountryWall />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                    Pre-registros por categoría
                  </h3>
                  <div className="mt-5">
                    <CategoryMeters />
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="mt-14">
              <Reveal>
                <PreInscritosList />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Sponsors ─────────────────────────────────────────────────── */}
        <section className="border-t border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
              Con el apoyo de
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {SPONSORS.map((s) => (
                <li
                  key={s}
                  className="font-display text-sm font-black uppercase tracking-[0.08em] text-white/40 transition-colors hover:text-white/80 sm:text-base"
                >
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-center text-sm text-[var(--text-dim)]">
              ¿Preguntas sobre el pre-registro?{" "}
              <Link
                href="/contacto"
                className="font-semibold text-[#4C8DFF] transition-colors hover:text-white"
              >
                Contáctanos
              </Link>
            </p>
          </div>
        </section>
      </div>
    </LatinoamericanoStore>
  );
}
