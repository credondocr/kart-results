import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import { fetchTeleredKartVideos } from "@/app/utils/telered";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Transmisiones | Costa Rica Kart Championship",
  description:
    "Resúmenes y transmisiones del kartismo nacional por Telered Television.",
};

export default async function TransmisionesPage() {
  const videos = await fetchTeleredKartVideos(24);

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
              Telered Television
            </p>
            <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Transmisiones
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-dim)]">
              Resúmenes y carreras del kartismo nacional, cortesía de{" "}
              <a
                href="https://www.youtube.com/@teleredtelevision5270"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#4C8DFF] hover:opacity-80"
              >
                Telered
              </a>
              .
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#4C8DFF]/60 active:scale-[0.98]"
          >
            ← Volver al inicio
          </Link>
        </div>

        {videos.length === 0 ? (
          <p className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 px-4 py-8 text-center text-sm text-[var(--text-dim)]">
            Por ahora no hay transmisiones de kart disponibles en el canal.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 transition-colors hover:border-[#4C8DFF]/50"
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
        )}
      </div>
    </div>
  );
}
