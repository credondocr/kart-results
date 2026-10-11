import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import { fetchGalleryGroups } from "@/app/utils/gallery";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galería | Costa Rica Kart Championship",
  description:
    "Fotos del paddock, las carreras y el karting nacional del Costa Rica Kart Championship.",
};

export default async function GaleriaPage() {
  const groups = await fetchGalleryGroups(60);
  const total = groups.reduce((n, g) => n + g.photos.length, 0);

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-24">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
          Paddock
        </p>
        <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Galería
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--text-dim)]">
          Fotos de carreras, pilotos y el paddock del CRKC.
          {total > 0 ? ` ${total} fotos.` : ""}
        </p>

        {groups.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/30 p-10 text-center">
            <p className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
              Aún no hay fotos
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-dim)]">
              Cuando se suban fotos a la carpeta de Drive del campeonato,
              aparecerán aquí automáticamente.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block text-sm font-semibold text-[#4C8DFF] hover:opacity-80"
            >
              ← Volver al inicio
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.id} className="mt-10 first:mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                  {group.name}
                </h2>
                <span className="font-mono text-xs tabular-nums text-[var(--text-dim)]">
                  {group.photos.length}{" "}
                  {group.photos.length === 1 ? "foto" : "fotos"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {group.photos.map((photo, i) => (
                  <a
                    key={photo.id}
                    href={photo.full}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40"
                    style={{ aspectRatio: i % 5 === 0 ? "4/3" : "1/1" }}
                  >
                    <Image
                      src={photo.thumb}
                      alt={photo.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
