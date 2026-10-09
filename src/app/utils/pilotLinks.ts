import { Drivers } from "@/data/drivers/data";
import { normalizeName, findHistoryEntry } from "./pilotHistory";

export interface PilotLink {
  slug: string;
  id: number | string;
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
  if (team) {
    const entry = findHistoryEntry(team, String(number));
    if (entry && normalizeName(entry.driver) === target) {
      return { slug: entry.team, id: entry.number };
    }
  }

  return null;
}
