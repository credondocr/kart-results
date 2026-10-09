import { Drivers } from "@/data/drivers/data";
import { getHistoryPilots, nameMatches, toPilotShape } from "./pilotHistory";
import type { Pilot } from "@/data/types";

/**
 * Roster de un equipo: perfiles de drivers/data + pilotos que solo
 * aparecen en el historial de posiciones (fichas sintéticas).
 */
export function getTeamRoster(slug: string): Pilot[] {
  const profiles = Drivers.filter((driver) => driver.teamLogo === slug);
  const historyOnly = getHistoryPilots()
    .filter((pilot) => pilot.team === slug)
    .filter((pilot) => !profiles.some((driver) => nameMatches(driver.name, pilot.name)))
    .map(toPilotShape);
  return [...profiles, ...historyOnly];
}
