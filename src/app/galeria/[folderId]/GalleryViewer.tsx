"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryPhoto } from "@/app/utils/gallery";

interface Props {
  photos: GalleryPhoto[];
  title: string;
}

const AUTOPLAY_MS = 3500;

export default function GalleryViewer({ photos, title }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const total = photos.length;
  const current = photos[index];

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + total) % total);
    },
    [total]
  );

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
    setPlaying(false);
  };

  // Autoplay
  useEffect(() => {
    if (!open || !playing) {
      if (playTimer.current) clearInterval(playTimer.current);
      playTimer.current = null;
      return;
    }
    playTimer.current = setInterval(() => go(1), AUTOPLAY_MS);
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [open, playing, go]);

  // Teclado
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  // Scroll del carrusel de thumbs hacia la activa
  useEffect(() => {
    if (!open || !thumbStripRef.current) return;
    const el = thumbStripRef.current.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index, open]);

  if (total === 0) return null;

  return (
    <>
      {/* Grid de thumbnails */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openAt(i)}
              className="group relative block aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF]"
              aria-label={`Ver foto ${i + 1} de ${total}`}
            >
              <Image
                src={photo.thumb}
                alt={photo.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
                unoptimized
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden="true">
                  <path d="M15 5l-1.4 1.4L18.2 11H3v2h15.2l-4.6 4.6L15 19l7-7-7-7z" transform="rotate(180 12 12)" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {open && current ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — foto ${index + 1} de ${total}`}
          onClick={() => setOpen(false)}
        >
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-sm tabular-nums text-[var(--text-dim)]">
              <span className="text-white">{index + 1}</span> / {total}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Imagen principal */}
          <div
            className="relative min-h-0 flex-1"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.full}
              alt={current.name}
              className="mx-auto max-h-full max-w-full object-contain select-none"
              draggable={false}
            />

            {/* Nav arrows */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
              aria-label="Foto anterior"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
              aria-label="Siguiente foto"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Controles + carrusel */}
          <div
            className="shrink-0 border-t border-white/10 bg-black/60 px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Anterior"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4C8DFF] text-white transition-all hover:bg-[#3a7cf0] active:scale-95"
                aria-label={playing ? "Pausar" : "Reproducir"}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Siguiente"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Carrusel de thumbs */}
            <div
              ref={thumbStripRef}
              className="mx-auto mt-3 flex max-w-4xl gap-2 overflow-x-auto pb-1"
              role="listbox"
              aria-label="Fotos en cola"
            >
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  role="option"
                  aria-selected={i === index}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16 ${
                    i === index
                      ? "border-[#4C8DFF] opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumb}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            <p className="mt-2 truncate text-center text-xs text-[var(--text-dim)]">
              {current.name}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
