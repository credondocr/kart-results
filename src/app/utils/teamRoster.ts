import { Drivers } from "@/data/drivers/data";
import {
  getHistoryPilots,
  samePerson,
  toPilotShape,
  type HistoryPilot,
} from "./pilotHistory";
import type { Pilot } from "@/data/types";

/** Quita duplicados: mismo número + misma persona (grafías distintas). */
export function uniqueHistoryPilots(pilots: HistoryPilot[]): HistoryPilot[] {
  const accepted: HistoryPilot[] = [];
  for (const pilot of pilots) {
    const duplicate = accepted.some(
      (other) =>
        String(other.number) === String(pilot.number) && samePerson(other.name, pilot.name)
    );
    if (!duplicate) accepted.push(pilot);
  }
  return accepted;
}

/**
 * Roster de un equipo: perfiles de drivers/data + pilotos que solo
 * aparecen en el historial de posiciones (fichas sintéticas).
 *
 * Nota: (equipo, número) NO identifica a una persona entre temporadas
 * (los números se reutilizan), por eso la deduplicación combina número
 * + samePerson y las fichas sintéticas llevan ?p=<nombre>.
 */
export function getTeamRoster(slug: string): Pilot[] {
  const profiles = Drivers.filter((driver) => driver.teamLogo === slug);

  const roster: Pilot[] = [];
  const seenProfileNumbers = new Set<string>();

  for (const profile of profiles) {
    const key = `${profile.teamLogo}-${profile.kartNumber}`;
    if (seenProfileNumbers.has(key)) continue; // dup literal en drivers/data
    seenProfileNumbers.add(key);
    roster.push(profile);
  }

  const historyOnly = uniqueHistoryPilots(
    getHistoryPilots()
      .filter((pilot) => pilot.team === slug)
      .filter((pilot) => !profiles.some((driver) => samePerson(driver.name, pilot.name)))
  );

  return [...roster, ...historyOnly.map(toPilotShape)];
}
