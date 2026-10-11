import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, dbUrl } from "@/lib/db";
import { TEAMS } from "@/data/drivers/teams";
import pilotPhotos from "@/data/pilotPhotos.json";
import { Championships } from "@/data/history";
import { findPilotProfileByName, pilotLinkHref } from "@/app/utils/pilotLinks";
import NextRaceCountdown from "@/app/components/landing/NextRaceCountdown";
import TaglineReveal from "@/app/components/landing/TaglineReveal";
import CategoryMarquee from "@/app/components/landing/CategoryMarquee";
import Reveal from "@/app/components/landing/Reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Costa Rica Kart Championship — Pista, puntos y pasión",
  description:
    "Próxima fecha, inscripciones y posiciones oficiales del Costa Rica Kart Championship.",
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

/** Categorías con datos en la temporada en curso (año actual o la última). */
function activeCategories(): string[] {
  const nowYear = String(new Date().getFullYear());
  const champ =
    Championships.years.find((c) => c.year === nowYear) ??
    [...Championships.years].sort((a, b) => Number(b.year) - Number(a.year))[0];
  const names = new Set<string>();
  for (const season of ["invierno", "verano"] as const) {
    for (const cls of champ?.[season]?.classes ?? []) {
      const named = cls.categories.filter((c) => c.name);
      if (named.length) named.forEach((c) => names.add(c.name));
      else if (cls.title) names.add(cls.title);
    }
  }
  return [...names];
}

interface Face {
  file: string;
  name: string;
  key: string;
  href: string;
}

/** Muestra aleatoria de pilotos con foto (se re-mezcla en cada ISR ~60s). */
function sampleFaces(n: number, exclude: Set<string> = new Set()): Face[] {
  const pool = Object.entries(pilotPhotos as Record<string, string>)
    .filter(([key]) => !exclude.has(key))
    .map(([key, file]) => {
      const name = key
        .split("-")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ");
      const link = findPilotProfileByName(name);
      return {
        file,
        key,
        name,
        href: link ? pilotLinkHref(link) : "/equipos",
      };
    });
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

const NEWS = [
  {
    date: "10 oct",
    tag: "Inscripciones",
    title: "Abren inscripciones para la próxima fecha",
  },
  {
    date: "28 sep",
    tag: "Campeonato",
    title: "El invierno se define en la última fecha",
  },
  {
    date: "15 sep",
    tag: "Sitio",
    title: "Live timing con datos de SpeedHive",
  },
];

export default async function HomePage() {
  const race = await getNextRace();
  const heroFaces = sampleFaces(7);
  const avatars = heroFaces.slice(0, 4);
  const heroCards = heroFaces.slice(4, 7);
  const used = new Set(heroFaces.map((f) => f.key));
  const paddockFaces = sampleFaces(6, used);
  const raceDate = race ? new Date(race.race_date) : null;
  const dateLabel = raceDate
    ? raceDate.toLocaleDateString("es-CR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <main className="min-h-screen bg-[var(--ink-950)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)] pb-14 pt-28 sm:pt-32">
        <div
          className="pointer-events-none absolute -right-16 top-0 hidden h-full w-20 rotate-12 bg-[repeating-linear-gradient(180deg,#4C8DFF_0_18px,transparent_18px_36px)] opacity-30 lg:block"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
              Temporada 2026
            </p>
            <h1
              className="mt-3 max-w-[680px] font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ textWrap: "balance" }}
            >
              <span className="bg-gradient-to-r from-white to-[#9BA3BD] bg-clip-text text-transparent">
                Karting
                <br />
                nacional
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-base text-[var(--text-dim)]">
              Vuelta a vuelta, de la pista a tu teléfono.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/inscribir"
                className="rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
              >
                Inscribirme
              </Link>
              <Link
                href="/Campeonato"
                className="rounded-lg border border-[var(--line-strong)] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#4C8DFF]/60 active:scale-[0.98]"
              >
                Ver campeonato
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((p) => (
                  <Image
                    key={p.file}
                    src={`/pilotos/${p.file}`}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="h-10 w-10 rounded-full border-2 border-[var(--ink-950)] object-cover object-top"
                  />
                ))}
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                <span className="font-bold text-white">500+ pilotos</span> en el
                registro
              </p>
            </div>
          </div>

          {/* Visual: pilotos + pit board */}
          <div className="relative">
            <div className="mb-4 flex justify-center gap-3 lg:mb-5 lg:justify-end">
              {heroCards.map((p, i) => (
                <Link
                  key={p.file}
                  href={p.href}
                  className="relative block w-[31%] max-w-[130px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5"
                  style={{ transform: `rotate(${(i - 1) * 2.5}deg)` }}
                >
                  <Image
                    src={`/pilotos/${p.file}`}
                    alt={p.name}
                    width={260}
                    height={320}
                    className="aspect-[3/4] w-full object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070A14] via-[#070A14]/80 to-transparent p-2 pt-6">
                    <p className="truncate font-display text-[11px] font-bold uppercase tracking-wide text-white">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/logos/acek.png"
                    alt="ACEK"
                    width={72}
                    height={44}
                    className="h-7 w-auto opacity-90"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">
                    Próxima fecha
                  </p>
                </div>
                {race ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#4C8DFF]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4C8DFF]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4C8DFF] opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4C8DFF]" />
                    </span>
                    Abiertas
                  </span>
                ) : null}
              </div>
              {race ? (
                <>
                  <h2 className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                    {race.name}
                  </h2>
                  <p className="mt-1 text-sm capitalize text-[var(--text-dim)]">
                    {dateLabel}
                    {race.location ? ` · ${race.location}` : ""}
                  </p>
                  <div className="mt-4">
                    <NextRaceCountdown targetIso={race.race_date} />
                  </div>
                  <Link
                    href="/inscribir"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a7cf0]"
                  >
                    Inscribirme a esta fecha
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 font-display text-xl font-extrabold uppercase text-white">
                    Fecha por anunciar
                  </p>
                  <Link
                    href="/Campeonato"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[var(--line-strong)] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Ver posiciones
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <CategoryMarquee items={activeCategories()} />

      {/* Tagline + sello de marca */}
      <section className="border-b border-[var(--line)] py-20 sm:py-28" aria-label="Manifiesto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Image
              src="/logos/acek.png"
              alt="Costa Rica Kart Championship"
              width={1176}
              height={704}
              className="mb-8 h-auto w-28 opacity-90 sm:w-32"
            />
          </Reveal>
          <TaglineReveal text="Cinco fechas un campeonato el mismo reloj para todos" />
        </div>
      </section>

      {/* Paddock */}
      <section className="border-b border-[var(--line)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                El paddock
              </h2>
              <Link
                href="/equipos"
                className="text-sm font-semibold text-[#4C8DFF] hover:opacity-80"
              >
                Ver equipos
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {paddockFaces.map((p, i) => (
              <Reveal key={p.file} delayMs={i * 60}>
                <Link
                  href={p.href}
                  className="group block overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 transition-colors hover:border-[#4C8DFF]/50"
                >
                  <Image
                    src={`/pilotos/${p.file}`}
                    alt={p.name}
                    width={220}
                    height={280}
                    className="aspect-[3/4] w-full object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                  <div className="p-2 text-center">
                    <p className="truncate text-[11px] font-semibold text-white">
                      {p.name}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Noticias + accesos */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                  Noticias
                </h2>
                <ul className="mt-4 divide-y divide-[var(--line)]">
                  {NEWS.map((n) => (
                    <li key={n.title} className="py-3">
                      <div className="flex items-baseline gap-3">
                        <time className="w-14 shrink-0 font-mono text-[11px] text-[var(--text-dim)]">
                          {n.date}
                        </time>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4C8DFF]">
                            {n.tag}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold leading-snug text-white">
                            {n.title}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/Campeonato"
                  className="group rounded-2xl border border-[var(--line)] bg-[#4C8DFF]/10 p-6 transition-colors hover:border-[#4C8DFF]/50"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4C8DFF]">
                    Tablas
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                    Campeonato
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-dim)]">
                    Best 4, penales y vueltas rápidas.
                  </p>
                </Link>
                <Link
                  href="/en-vivo"
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6 transition-colors hover:border-red-500/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">
                      En vivo
                    </p>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                    Live timing
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-dim)]">
                    Gaps y posiciones en pista.
                  </p>
                </Link>
                <Link
                  href="/estadisticas"
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 p-6 transition-colors hover:border-[var(--line-strong)] sm:col-span-2"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                    Números
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                    Estadísticas y récords
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-dim)]">
                    Poles, remontadas y récords por circuito.
                  </p>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Equipos */}
          <Reveal>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/30 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  {TEAMS.filter((t) => t.visible !== false)
                    .slice(0, 8)
                    .map((t) => (
                      <Image
                        key={t.slug}
                        src={t.logo}
                        alt={t.name}
                        width={48}
                        height={48}
                        className="h-9 w-9 object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10 sm:w-10"
                      />
                    ))}
                </div>
                <Link
                  href="/equipos"
                  className="text-sm font-semibold text-[#4C8DFF] hover:opacity-80"
                >
                  Paddock completo →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
