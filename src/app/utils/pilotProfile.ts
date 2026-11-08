import { Drivers } from "@/data/drivers/data";
import {
  findHistoryEntry,
  findHistoryEntryByName,
  getPilotRacedCategories,
  samePerson,
} from "./pilotHistory";
import type { Pilot } from "@/data/types";

export const prettifyTeam = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Edad cumplida a partir de una fecha ISO (YYYY-MM-DD). */
export function ageFrom(birthDate: string, today: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const born = new Date(year, month, day);
  if (Number.isNaN(born.getTime())) return null;
  let age = today.getFullYear() - born.getFullYear();
  const beforeBirthday =
    today.getMonth() < month || (today.getMonth() === month && today.getDate() < day);
  if (beforeBirthday) age--;
  return age >= 0 ? age : null;
}

/**
 * Perfil de drivers/data para (equipo, número).
 *
 * `teamLogo` puede estar desactualizado (el equipo actual vive en el
 * registro): con `nameHint` se acepta también la ficha que coincide por
 * número + nombre aunque esté declarada en otro equipo.
 */
export function findDriverPilot(teamSlug: string, id: string, nameHint?: string): Pilot | undefined {
  const number = Number(id);
  if (!Number.isInteger(number)) return undefined;

  const sameNumber = Drivers.filter((driver) => driver.kartNumber === number);
  const inTeam = sameNumber.filter(
    (driver) => driver.teamLogo.toLowerCase() === teamSlug
  );

  if (nameHint) {
    return (
      inTeam.find((driver) => samePerson(driver.name, nameHint)) ??
      sameNumber.find((driver) => samePerson(driver.name, nameHint))
    );
  }

  return inTeam[0];
}

/** Ficha sintética para pilotos que solo existen en el historial de posiciones. */
export function synthesizePilot(teamSlug: string, id: string, entry: { driver: string; country: string }): Pilot {
  const raced = getPilotRacedCategories(entry.driver, id);
  return {
    name: entry.driver,
    kartNumber: id,
    categories: raced.length > 0 ? raced.map((category) => category.label) : [],
    biography: "",
    country: entry.country,
    teamName: prettifyTeam(teamSlug),
    profileUrl: "",
    teamLogo: teamSlug,
  };
}

/**
 * Resuelve la ficha de un piloto: con `nameHint` (?p=) prioriza a la
 * persona (perfil por número+nombre, luego historial) porque los números
 * se reutilizan entre temporadas; si no, perfiles de drivers/data y por
 * último historial.
 */
export function resolvePilot(teamSlug: string, id: string, nameHint?: string): Pilot | undefined {
  if (nameHint) {
    const hinted = findDriverPilot(teamSlug, id, nameHint);
    if (hinted) return hinted;

    const entry =
      findHistoryEntry(teamSlug, id, nameHint) ?? findHistoryEntryByName(nameHint, id);
    if (entry) return synthesizePilot(teamSlug, id, entry);
  }

  const driver = findDriverPilot(teamSlug, id);
  if (driver) return driver;

  const entry = findHistoryEntry(teamSlug, id);
  if (entry) return synthesizePilot(teamSlug, id, entry);

  return undefined;
}
