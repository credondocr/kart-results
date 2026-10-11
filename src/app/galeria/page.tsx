import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import { fetchGalleryFolders } from "@/app/utils/gallery";
import FolderCard from "./FolderCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galería | Costa Rica Kart Championship",
  description:
    "Fotos del paddock, las carreras y el karting nacional del Costa Rica Kart Championship.",
};

export default async function GaleriaPage() {
  const folders = await fetchGalleryFolders();

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
        </p>

        {folders.length === 0 ? (
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
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
