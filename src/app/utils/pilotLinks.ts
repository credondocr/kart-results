import { Drivers } from "@/data/drivers/data";
import { normalizeName } from "./pilotHistory";

export interface PilotLink {
  slug: string;
  id: number;
}

/**
 * Resuelve la ficha de un piloto mostrado en las tablas de posiciones.
 * Prioridad: nombre exacto + equipo → nombre exacto → nombre parcial +
 * equipo → nombre parcial → equipo + número de kart.
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

  if (!hit) {
    hit =
      Drivers.find(
        (candidate) =>
          candidate.teamLogo === team && String(candidate.kartNumber) === String(number)
      ) ?? undefined;
  }

  return hit ? { slug: hit.teamLogo, id: hit.kartNumber } : null;
}
