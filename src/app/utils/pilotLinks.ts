import { Drivers } from "@/data/drivers/data";
import { normalizeName, findHistoryEntry, getPilotHistory } from "./pilotHistory";

export interface PilotLink {
  slug: string;
  id: number | string;
  /** Nombre del piloto como hint (?p=) cuando la ficha es sintética:
   *  los números de kart se reutilizan entre temporadas. */
  hint?: string;
}

export function pilotLinkHref(link: PilotLink): string {
  const hint = link.hint ? `?p=${encodeURIComponent(link.hint)}` : "";
  return `/equipos/equipo/${link.slug}/${link.id}${hint}`;
}

/**
 * Resuelve la ficha de un piloto mostrado en las tablas de posiciones.
 * Prioridad: nombre exacto + equipo → nombre exacto → nombre parcial +
 * equipo → nombre parcial → equipo + número → historial (ficha sintética).
 */
export function findPilotProfile(
  driver: string,
  number: number | string,
  team: string
): PilotLink | null {
  const target = normalizeName(driver);
  if (!target) return null;

  const pick = (list: typeof Drivers) =>
    list.find((candidate) => candidate.teamLogo === team) ?? list[0];

  const exact = Drivers.filter((candidate) => normalizeName(candidate.name) === target);
  let hit = exact.length > 0 ? pick(exact) : undefined;

  if (!hit) {
    const partial = Drivers.filter((candidate) => {
      const name = normalizeName(candidate.name);
      return name.startsWith(target + " ") || target.startsWith(name + " ");
    });
    hit = partial.length > 0 ? pick(partial) : undefined;
  }

  if (!hit && team) {
    hit = Drivers.find(
      (candidate) =>
        candidate.teamLogo === team && String(candidate.kartNumber) === String(number)
    );
  }

  if (hit) return { slug: hit.teamLogo, id: hit.kartNumber };

  // Pilotos que solo existen en el historial de posiciones (ficha sintética).
  // El nombre hace de hint: los números se reutilizan entre temporadas.
  if (team) {
    const entry = findHistoryEntry(team, String(number), driver);
    if (entry) return { slug: entry.team, id: entry.number, hint: normalizeName(driver) };
  }

  return null;
}

/**
 * Resuelve la ficha solo por nombre (landing, búsquedas).
 * Prioridad: Drivers exacto → Drivers parcial único → historial (reciente).
 */
export function findPilotProfileByName(driver: string): PilotLink | null {
  const target = normalizeName(driver);
  if (!target) return null;

  const exact = Drivers.filter(
    (candidate) => normalizeName(candidate.name) === target
  );
  if (exact.length > 0) {
    return { slug: exact[0].teamLogo, id: exact[0].kartNumber };
  }

  const partial = Drivers.filter((candidate) => {
    const name = normalizeName(candidate.name);
    return name.startsWith(target + " ") || target.startsWith(name + " ");
  });
  if (partial.length === 1) {
    return { slug: partial[0].teamLogo, id: partial[0].kartNumber };
  }

  const history = getPilotHistory(driver);
  if (history.length > 0) {
    const entry = history[0];
    return { slug: entry.team, id: entry.number, hint: normalizeName(driver) };
  }

  return null;
}
