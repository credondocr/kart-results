import manifest from "@/data/pilotPhotos.json";
import { normalizeName } from "./pilotHistory";

const PHOTOS = manifest as Record<string, string>;

/** Clave de foto igual a la del normalizador de scripts/normalize-pilot-photos.ts */
function photoKey(name: string): string {
  return normalizeName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Foto normalizada de un piloto (`/pilotos/<clave>.webp`) o null.
 * Acepta variantes: "José A. Halphen" ↔ "jose-a-halphen" y nombres
 * parciales cuando son únicos ("Stefano Morice" → "…-videche").
 */
export function findPilotPhoto(name: string): string | null {
  const key = photoKey(name);
  if (!key) return null;

  const exact = PHOTOS[key];
  if (exact) return `/pilotos/${exact}`;

  const target = normalizeName(name).replace(/[^a-z0-9]+/g, " ").trim();
  const matches = Object.keys(PHOTOS).filter((photoKeyCandidate) => {
    const photoName = photoKeyCandidate.replace(/-/g, " ");
    return photoName.startsWith(target + " ") || target.startsWith(photoName + " ");
  });

  return matches.length === 1 ? `/pilotos/${PHOTOS[matches[0]]}` : null;
}
