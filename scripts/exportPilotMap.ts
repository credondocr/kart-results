/**
 * Flattens Championships history into a pilot -> year -> { country, team } map
 * so the same pilot can have different team/country per year (e.g. 2024 vs 2025).
 * Writes to ../latinoamericano/src/data/pilotHistoryMap.json
 * Run from kart-results root: npm run export-pilot-map
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Championships } from '../src/data/history';

interface PilotEntry {
  country: string;
  team: string;
}

/** Map: normalized driver name -> year string -> { country, team } */
type PilotHistoryMap = Record<string, Record<string, PilotEntry>>;

function normalizeDriverName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

const map: PilotHistoryMap = {};

for (const championship of Championships.years) {
  const yearStr = String(championship.year ?? '').trim();
  if (!yearStr) continue;
  for (const season of [championship.verano, championship.invierno]) {
    if (!season?.classes) continue;
    for (const cls of season.classes) {
      for (const cat of cls.categories ?? []) {
        for (const result of cat.results ?? []) {
          const driver = (result as { driver?: string }).driver?.trim();
          const country = (result as { country?: string }).country?.trim().toUpperCase().slice(0, 2);
          const team = (result as { team?: string }).team?.trim();
          if (driver && country && team) {
            const key = normalizeDriverName(driver);
            if (!map[key]) map[key] = {};
            map[key][yearStr] = { country, team };
          }
        }
      }
    }
  }
}

const outPath = resolve(process.cwd(), '../latinoamericano/src/data/pilotHistoryMap.json');
writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf-8');
const pilotCount = Object.keys(map).length;
const yearEntries = Object.values(map).reduce((sum, byYear) => sum + Object.keys(byYear).length, 0);
console.log(`Wrote ${pilotCount} pilots, ${yearEntries} year entries to ${outPath}`);
