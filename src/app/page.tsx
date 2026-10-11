import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, dbUrl } from "@/lib/db";
import { TEAMS } from "@/data/drivers/teams";
import NextRaceCountdown from "@/app/components/landing/NextRaceCountdown";
import TaglineReveal from "@/app/components/landing/TaglineReveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Costa Rica Kart Championship — Pista, puntos y pasión",
  description:
    "El sitio oficial del CRKC: próxima fecha, inscripciones, posiciones oficiales, equipos y estadísticas del karting nacional.",
};

interface NextRace {
  name: string;
  race_date: string;
  location: string | null;
  categories: string[];
}

async function getNextRace(): Promise<NextRace | null> {
  if (!dbUrl()) return null;
  try {
    const sql = db();
    const rows = (await sql`
      SELECT name, race_date, location, categories
      FROM race_dates
      WHERE status = 'open' AND race_date > now()
      ORDER BY race_date
      LIMIT 1
    `) as unknown as Array<NextRace>;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

const NEWS = [
  {
    date: "10 oct 2026",
    tag: "Inscripciones",
    title: "Abren las inscripciones para la próxima fecha",
    excerpt:
      "Crea tu cuenta con la invitación del admin y completa tu ficha antes del cierre. Puedes pagar por transferencia o en pista.",
  },
  {
    date: "28 sep 2026",
    tag: "Campeonato",
    title: "El invierno se define en la última fecha",
    excerpt:
      "Las categorías VLR y Tillotson llegan a la recta final con menos de 20 puntos de diferencia en el liderato.",
  },
  {
    date: "15 sep 2026",
    tag: "Sitio",
    title: "Live timing y resultados en tiempo real",
    excerpt:
      "Ahora puedes seguir vueltas, gaps y mejores tiempos desde el teléfono, con los mismos datos de SpeedHive.",
  },
];

export default async function HomePage() {
  const race = await getNextRace();
  const raceDate = race ? new Date(race.race_date) : null;
  const dateLabel = raceDate
    ? raceDate.toLocaleDateString("es-CR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[var(--ink-950)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)] pt-28 pb-16 sm:pt-32 lg:pt-36">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-full w-1.5 rotate-12 bg-[#4C8DFF]/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-10 top-0 h-full w-1 rotate-12 bg-[#4C8DFF]/10"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
              Temporada 2026
            </p>
            <h1
              className="mt-3 max-w-[680px] font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ textWrap: "balance" }}
            >
              <span className="bg-gradient-to-r from-white to-[#9BA3BD] bg-clip-text text-transparent">
                Karting nacional,
                <br />
                vuelta a vuelta
              </span>
            </h1>
            <p className="mt-5 max-w-[680px] text-base leading-relaxed text-[var(--text-dim)]">
              Posiciones oficiales, inscripciones y la próxima fecha del Costa
              Rica Kart Championship en un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/inscribir"
                className="inline-flex items-center rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
              >
                Inscribirme
              </Link>
              <Link
                href="/Campeonato"
                className="inline-flex items-center rounded-lg border border-[var(--line-strong)] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#4C8DFF]/60 active:scale-[0.98]"
              >
                Ver campeonato
              </Link>
            </div>
            <div className="mt-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Equipos del paddock
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-5 opacity-70">
                {TEAMS.filter((t) => t.visible !== false)
                  .slice(0, 7)
                  .map((t) => (
                    <Image
                      key={t.slug}
                      src={t.logo}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="h-9 w-9 object-contain grayscale transition-all duration-300 hover:grayscale-0 sm:h-10 sm:w-10"
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Próxima fecha */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                Próxima fecha
              </p>
              {race ? (
                <span className="rounded-full bg-[#4C8DFF]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4C8DFF]">
                  Inscripciones abiertas
                </span>
              ) : null}
            </div>

            {race ? (
              <>
                <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                  {race.name}
                </h2>
                <p className="mt-1 text-sm capitalize text-[var(--text-dim)]">
                  {dateLabel}
                  {race.location ? ` · ${race.location}` : ""}
                </p>
                <div className="mt-6">
                  <NextRaceCountdown targetIso={race.race_date} />
                </div>
                {race.categories?.length ? (
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {race.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-md border border-[var(--line)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-dim)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
                <Link
                  href="/inscribir"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
                >
                  Inscribirme a esta fecha
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                  Fecha por anunciar
                </p>
                <p className="mt-2 text-sm text-[var(--text-dim)]">
                  El calendario de la próxima temporada se publica pronto.
                  Sigue el campeonato mientras tanto.
                </p>
                <Link
                  href="/Campeonato"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-[var(--line-strong)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#4C8DFF]/60"
                >
                  Ver posiciones
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Tagline reveal */}
      <section
        className="border-b border-[var(--line)] py-20 sm:py-28"
        aria-label="Manifesto"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TaglineReveal text="Cinco fechas un campeonato el mismo reloj para todos" />
        </div>
      </section>

      {/* Noticias */}
      <section className="border-b border-[var(--line)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
              Noticias
            </h2>
            <Link
              href="/Campeonato"
              className="text-sm font-semibold text-[#4C8DFF] transition-opacity hover:opacity-80"
            >
              Ver campeonato
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6 transition-colors duration-300 hover:border-[#4C8DFF]/40"
              >
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <span className="rounded-md bg-[#4C8DFF]/15 px-2 py-0.5 text-[#4C8DFF]">
                    {n.tag}
                  </span>
                  <time className="text-[var(--text-dim)]">{n.date}</time>
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-white">
                  {n.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-dim)]">
                  {n.excerpt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
            <Link
              href="/Campeonato"
              className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[#4C8DFF]/10 p-8 transition-colors duration-300 hover:border-[#4C8DFF]/50"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4C8DFF]">
                Temporada en curso
              </p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-white">
                Campeonato
              </h3>
              <p className="mt-2 max-w-sm text-sm text-[var(--text-dim)]">
                Tablas por categoría, Best 4, penales y vueltas rápidas de cada
                fecha.
              </p>
              <span className="mt-6 inline-block text-sm font-semibold text-[#4C8DFF]">
                Abrir tablas →
              </span>
            </Link>
            <Link
              href="/en-vivo"
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6 transition-colors duration-300 hover:border-red-500/40"
            >
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
                  En vivo
                </p>
              </div>
              <h3 className="mt-3 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                Live timing
              </h3>
              <p className="mt-2 text-sm text-[var(--text-dim)]">
                Posiciones y gaps cuando el CRKC está en pista.
              </p>
            </Link>
            <Link
              href="/equipos"
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6 transition-colors duration-300 hover:border-[var(--line-strong)]"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                Paddock
              </p>
              <h3 className="mt-3 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                Equipos
              </h3>
              <p className="mt-2 text-sm text-[var(--text-dim)]">
                Rosters, fichas de pilotos y palmarés por escudería.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
