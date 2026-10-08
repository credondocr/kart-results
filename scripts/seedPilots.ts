/**
 * Seeds/merges src/data/pilots.json from the championship history.
 * Each pilot gets `teams: { <year>: <team> }` so imports for a past season use
 * the team they drove for back then; `team`/`country` keep the latest values.
 * Manual entries and aliases are preserved (history years win on conflict).
 *
 * Run: npm run seed:pilots
 */
import { mergeIntoRegistry } from "./lib/pilots";
import { PILOTS_PATH } from "./lib/paths";

const { added, updated, total } = mergeIntoRegistry();
console.log(
  `✓ Registro actualizado: ${added} nuevos, ${updated} actualizados, ${total} en total → ${PILOTS_PATH.replace(process.cwd(), ".")}`
);
