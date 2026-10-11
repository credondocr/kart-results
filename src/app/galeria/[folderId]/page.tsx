import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/app/components/Breadcrumb";
import { fetchFolderPhotos } from "@/app/utils/gallery";
import GalleryViewer from "./GalleryViewer";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { folderId } = await params;
  const data = await fetchFolderPhotos(folderId, 1);
  return {
    title: `${data?.name ?? "Galería"} | Costa Rica Kart Championship`,
    robots: { index: false, follow: false },
  };
}

export default async function SubGaleriaPage({ params }: PageProps) {
  const { folderId } = await params;
  const data = await fetchFolderPhotos(folderId, 100);
  if (!data || data.photos.length === 0) notFound();

  return (
    <div className="min-h-screen bg-[var(--ink-950)] pt-20">
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4C8DFF]">
              Galería
            </p>
            <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              {data.name}
            </h1>
            <p className="mt-1 font-mono text-xs tabular-nums text-[var(--text-dim)]">
              {data.photos.length} {data.photos.length === 1 ? "foto" : "fotos"}
            </p>
          </div>
          <Link
            href="/galeria"
            className="text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
          >
            ← Todas las galerías
          </Link>
        </div>
      </div>

      <GalleryViewer photos={data.photos} title={data.name} />
    </div>
  );
}
