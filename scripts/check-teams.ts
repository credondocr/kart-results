/**
 * Consistencia de equipos — guardia de la regla "una sola fuente de verdad":
 *
 *   asignación de equipo → src/data/pilots.json (tabla `pilots` de Neon, UI /admin/pilots)
 *   catálogo             → src/data/teams.json  (tabla `teams` de Neon,  UI /admin/teams)
 *
 *   npm run check:teams
 *
 * ERROR (exit 1):
 *   - un equipo actual (`team`) fuera del catálogo
 *   - un piloto apareciendo en más de una página de equipo
 *   - una ficha de roster que no resuelve (enlace a 404)
 * AVISO:
 *   - un `teams[año]` fuera del catálogo (dato histórico)
 *   - un perfil de drivers/* con teamLogo ≠ equipo actual (pendiente Fase 2)
 */
import { readFileSync } from "fs";
import { PILOTS_PATH } from "./lib/paths";
import { getTeamRoster } from "../src/app/utils/teamRoster";
import { resolvePilot } from "../src/app/utils/pilotProfile";
import { currentTeamOf } from "../src/app/utils/pilotRegistry";
import { normalizeName } from "../src/app/utils/naming";
import { Drivers } from "../src/data/drivers/data";
import teamsJson from "../src/data/teams.json";

type RegistryEntry = {
  name: string;
  team: string;
  teams?: Record<string, string>;
};

type Registry = Record<string, RegistryEntry>;

const catalog = new Set((teamsJson as { slug: string }[]).map((team) => team.slug));
const registry = JSON.parse(readFileSync(PILOTS_PATH, "utf8")) as Registry;

const errors: string[] = [];
const warnings: string[] = [];

// 1. Equipos actuales dentro del catálogo.
for (const entry of Object.values(registry)) {
  if (entry.team && !catalog.has(entry.team)) {
    errors.push(`equipo actual fuera del catálogo: ${entry.name} → "${entry.team}"`);
  }
  for (const [year, team] of Object.entries(entry.teams ?? {})) {
    if (team && !catalog.has(team)) {
      warnings.push(`teams[${year}] fuera del catálogo: ${entry.name} → "${team}"`);
    }
  }
}

// 2. Un piloto por página de equipo + fichas que resuelven.
const pagesOf = new Map<string, Set<string>>();
for (const slug of catalog) {
  for (const pilot of getTeamRoster(slug)) {
    const key = normalizeName(pilot.name);
    if (!key) continue;
    const pages = pagesOf.get(key) ?? new Set<string>();
    pages.add(slug);
    pagesOf.set(key, pages);

    const hint = normalizeName(pilot.name);
    if (!resolvePilot(slug, String(pilot.kartNumber), hint)) {
      errors.push(`ficha que no resuelve: /equipos/equipo/${slug}/${pilot.kartNumber} (${pilot.name})`);
    }
  }
}
for (const [name, pages] of pagesOf) {
  if (pages.size > 1) {
    errors.push(`piloto en ${pages.size} páginas de equipo: ${name} → ${[...pages].join(", ")}`);
  }
}

// 3. Perfiles estáticos desalineados (hasta que drivers/* deje de tener equipos).
const staleProfiles = Drivers.filter((driver) => {
  const current = currentTeamOf(driver.name, driver.teamLogo);
  return current !== driver.teamLogo;
});
for (const driver of staleProfiles) {
  warnings.push(
    `perfil drivers/* desalineado: ${driver.name} #${driver.kartNumber} ` +
      `teamLogo=${driver.teamLogo} → actual=${currentTeamOf(driver.name, driver.teamLogo)}`
  );
}

if (warnings.length) {
  console.log(`Avisos (${warnings.length}):`);
  for (const warning of warnings) console.log(`  · ${warning}`);
  console.log("");
}

if (errors.length) {
  console.error(`Errores (${errors.length}):`);
  for (const error of errors) console.log(`  ✗ ${error}`);
  process.exit(1);
}

console.log(
  `✓ equipos consistentes: ${catalog.size} equipos, ` +
    `${Object.keys(registry).length} pilotos en registro, ` +
    `${pagesOf.size} con página de equipo`
);
