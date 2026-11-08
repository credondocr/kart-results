import { Drivers } from "@/data/drivers/data";
import { normalizeName, findHistoryEntry, getPilotHistory } from "./pilotHistory";
import { currentTeamOf } from "./pilotRegistry";

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
 *
 * El slug sale del equipo actual (registro) cuando existe: `teamLogo` de
 * drivers/data puede quedar desactualizado tras un cambio de equipo, y en
 * ese caso se agrega `hint` para que la ficha resuelva por nombre.
 */
export function findPilotProfile(
  driver: string,
  number: number | string,
  team: string
): PilotLink | null {
  const target = normalizeName(driver);
  if (!target) return null;

  const pick = (list: typeof Drivers) =>
    list.find((candidate) => currentTeamOf(candidate.name, candidate.teamLogo) === team) ??
    list[0];

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
        currentTeamOf(candidate.name, candidate.teamLogo) === team &&
        String(candidate.kartNumber) === String(number)
    );
  }

  if (hit) return linkFor(hit);

  // Pilotos que solo existen en el historial de posiciones (ficha sintética).
  // El nombre hace de hint: los números se reutilizan entre temporadas.
  if (team) {
    const entry = findHistoryEntry(team, String(number), driver);
    if (entry) return { slug: entry.team, id: entry.number, hint: normalizeName(driver) };
  }

  return null;
}

/** Slug con el equipo actual + hint cuando el perfil quedó en otro equipo. */
function linkFor(profile: (typeof Drivers)[number]): PilotLink {
  const slug = currentTeamOf(profile.name, profile.teamLogo);
  const hint = slug === profile.teamLogo ? undefined : normalizeName(profile.name);
  return { slug, id: profile.kartNumber, hint };
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
    return linkFor(exact[0]);
  }

  const partial = Drivers.filter((candidate) => {
    const name = normalizeName(candidate.name);
    return name.startsWith(target + " ") || target.startsWith(name + " ");
  });
  if (partial.length === 1) {
    return linkFor(partial[0]);
  }

  const history = getPilotHistory(driver);
  if (history.length > 0) {
    const entry = history[0];
    return { slug: entry.team, id: entry.number, hint: normalizeName(driver) };
  }

  return null;
}
