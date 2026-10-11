import Link from "next/link";
import Image from "next/image";
import type { GalleryGroup } from "@/app/utils/gallery";

export default function FolderCard({ folder }: { folder: GalleryGroup }) {
  return (
    <Link
      href={`/galeria/${folder.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/40 transition-colors hover:border-[#4C8DFF]/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
        {folder.cover ? (
          <Image
            src={folder.cover}
            alt={folder.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-dim)]">
            <span className="font-display text-4xl font-black opacity-30">K</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-10">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
            {folder.name}
          </h2>
          <p className="mt-0.5 font-mono text-xs tabular-nums text-[var(--text-dim)]">
            {folder.photoCount} {folder.photoCount === 1 ? "foto" : "fotos"}
          </p>
        </div>
      </div>
    </Link>
  );
}
