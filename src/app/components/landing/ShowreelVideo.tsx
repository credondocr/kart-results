"use client";

import { useState } from "react";
import Image from "next/image";

const VIMEO_ID = "1113106735";
const VIMEO_HASH = "c265d409a0";
const POSTER =
  "https://i.vimeocdn.com/video/2051530020-4a72d02274dca56597b7bf9e5c28f57bc1a5733c1231071f9cdb838e79271c24-d_1920x1080";

/**
 * Banda cinemática full-bleed: el póster del video sangra con la página
 * (gradientes al ink-950, sin card), con titular display y control de play
 * integrado en la composición. El iframe solo se monta tras el clic.
 */
export default function ShowreelVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      aria-label="La temporada en imágenes"
      className="relative"
    >
      <div className="group relative h-[68svh] max-h-[760px] min-h-[440px] w-full overflow-hidden bg-[#070A14]">
        {!playing && (
          <>
            {/* Hit area completa + imagen de fondo */}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Reproducir video de temporada"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4C8DFF]"
            >
              <Image
                src={POSTER}
                alt="Karting en Costa Rica — la temporada en imágenes"
                fill
                sizes="100vw"
                className="plx-slow object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]"
              />
              <span
                className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#070A14] to-transparent"
                aria-hidden="true"
              />
              <span
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#070A14] via-[#070A14]/45 to-transparent sm:w-3/5"
                aria-hidden="true"
              />
              <span
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#070A14] via-[#070A14]/70 to-transparent"
                aria-hidden="true"
              />
              <span
                className="plx-slow pointer-events-none absolute -right-16 top-0 hidden h-full w-20 rotate-12 bg-[repeating-linear-gradient(180deg,#4C8DFF_0_18px,transparent_18px_36px)] opacity-20 lg:block"
                aria-hidden="true"
              />
            </button>

            {/* Titular + control de play (presentación; el botón real cubre la banda) */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-end">
              <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
                <h2
                  className="max-w-[12ch] font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ textWrap: "balance" }}
                >
                  La temporada
                  <br />
                  en imágenes
                </h2>
                <span className="mt-6 flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#4C8DFF] shadow-[0_8px_32px_rgba(76,141,255,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 sm:h-16 sm:w-16">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-1 h-5 w-5 fill-white sm:h-6 sm:w-6"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="text-base font-semibold text-white">
                    Ver video
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {playing && (
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_ID}?h=${VIMEO_HASH}&autoplay=1&title=0&byline=0&portrait=0&loop=1`}
            title="Showreel ACEK — karting en Costa Rica"
            className="absolute inset-0 z-30 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </section>
  );
}
