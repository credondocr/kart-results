import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db, dbUrl } from "@/lib/db";
import { TEAMS } from "@/data/drivers/teams";
import pilotPhotos from "@/data/pilotPhotos.json";
import { fetchTeleredKartVideos, fetchTeleredLiveKart, isLiveCheckWindow } from "@/app/utils/telered";
import { findPilotProfileByName, pilotLinkHref } from "@/app/utils/pilotLinks";
import NextRaceCountdown from "@/app/components/landing/NextRaceCountdown";
import TaglineReveal from "@/app/components/landing/TaglineReveal";
import CategoryMarquee from "@/app/components/landing/CategoryMarquee";
import Reveal from "@/app/components/landing/Reveal";
import ShowreelVideo from "@/app/components/landing/ShowreelVideo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Costa Rica Kart Championship — Pista, puntos y pasión",
  description:
    "Próxima fecha, inscripciones y posiciones oficiales del Costa Rica Kart Championship.",
};

interface NextRace {
  id: number;
  name: string;
  race_date: string;
  location: string | null;
  categories: string[];
  status: string;
}

async function getNextRace(): Promise<NextRace | null> {
  if (!dbUrl()) return null;
  try {
    const sql = db();
    // Muestra la fecha si está abierta o cerrada, hasta el día de la carrera
    // (cerrada = no admite más inscripciones, pero el card sigue visible).
    const rows = (await sql`
      SELECT id, name, race_date, location, categories, status
      FROM race_dates
      WHERE status IN ('open', 'closed')
        AND race_date > now() - interval '1 day'
      ORDER BY race_date
      LIMIT 1
    `) as unknown as Array<NextRace>;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Categorías activas en la DB (catálogo admin); fallback vacío. */
async function activeCategories(): Promise<string[]> {
  if (!dbUrl()) return [];
  try {
    const sql = db();
    const rows = (await sql`
      SELECT name FROM categories WHERE active = true
      ORDER BY sort_order, name
    `) as unknown as Array<{ name: string }>;
    return rows.map((r) => r.name);
  } catch {
    return [];
  }
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

export default async function HomePage() {
  const race = await getNextRace();
  const broadcasts = await fetchTeleredKartVideos(3);
  const categories = await activeCategories();
  const live = await fetchTeleredLiveKart(isLiveCheckWindow(race?.race_date));
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
          className="plx-slow pointer-events-none absolute -right-16 top-0 hidden h-full w-20 rotate-12 bg-[repeating-linear-gradient(180deg,#4C8DFF_0_18px,transparent_18px_36px)] opacity-30 lg:block"
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
              {/* Temporalmente oculto:
              <Link
                href="/inscribir"
                className="rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
              >
                Inscribirme
              </Link>
              */}
              <Link
                href="/Campeonato"
                className="rounded-lg bg-[#4C8DFF] px-5 py-3 text-base font-semibold text-white shadow-lg shadow-[#4C8DFF]/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#3a7cf0] active:scale-[0.98]"
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
            <div className="plx-medium mb-4 flex justify-center gap-3 lg:mb-5 lg:justify-end">
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

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/60 p-5 shadow-xl shadow-black/40 sm:p-6">
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
                  race.status === "open" ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-[#4C8DFF]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4C8DFF]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4C8DFF] opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4C8DFF]" />
                      </span>
                      Abiertas
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">
                      Cerradas
                    </span>
                  )
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

      {/* EN VIVO Telered */}
      {live && (
        <section className="border-b border-[var(--line)] bg-red-500/[0.06] py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                En vivo · Telered
              </p>
              <h2 className="mt-2 max-w-xl font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-3xl">
                {live.title}
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={live.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-base font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-500 active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Ver en YouTube
                </a>
                <a
                  href={`/transmisiones`}
                  className="inline-flex items-center rounded-lg border border-[var(--line-strong)] px-5 py-3 text-base font-semibold text-white transition-colors hover:border-red-400/60"
                >
                  Otras transmisiones
                </a>
              </div>
            </div>
            <a
              href={live.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block w-full max-w-md shrink-0 overflow-hidden rounded-2xl border border-red-500/40 lg:w-[420px]"
            >
              <Image
                src={live.thumb}
                alt={live.title}
                width={480}
                height={360}
                className="aspect-video w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </a>
          </div>
        </section>
      )}

      {categories.length > 0 && <CategoryMarquee items={categories} />}

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
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                  El paddock
                </h2>
              </div>
              <Link
                href="/equipos"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#4C8DFF]/60 active:scale-[0.98]"
              >
                Ver equipos
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
              {paddockFaces.map((p) => (
                <Link
                  key={p.file}
                  href={p.href}
                  className="group overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-[#4C8DFF]/50"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={`/pilotos/${p.file}`}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 160px"
                      className="object-cover object-top grayscale transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070A14] via-[#070A14]/60 to-transparent" />
                  </div>
                  <div className="px-2 pb-2.5 pt-1.5">
                    <p className="truncate text-center text-[11px] font-semibold leading-tight text-white">
                      {p.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Transmisiones Telered */}
      {broadcasts.length > 0 && (
        <section className="border-b border-[var(--line)] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
                    Telered
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                    Transmisiones
                  </h2>
                </div>
                <Link
                  href="/transmisiones"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#4C8DFF]/60 active:scale-[0.98]"
                >
                  Ver todas
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {broadcasts.map((video) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-[#4C8DFF]/50"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <Image
                        src={video.thumb}
                        alt={video.title}
                        width={480}
                        height={360}
                        className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                      />
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                        {video.title}
                      </p>
                      <time className="mt-1 block font-mono text-[11px] text-[var(--text-dim)]">
                        {video.publishedAt.slice(0, 10)}
                      </time>
                    </div>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Accesos rápidos */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </Reveal>
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

      {/* Showreel de temporada */}
      <ShowreelVideo />
    </main>
  );
}
