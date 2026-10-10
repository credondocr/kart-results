/**
 * Sembra/actualiza src/data/pilots.json:
 *  1) desde el histórico del campeonato (team/country por año)
 *  2) agrega pilotos faltantes que solo aparecen en eventos SpeedHive
 *     (con team/country vacíos, para completarlos a mano)
 *
 * Los aliases y ediciones manuales se preservan.
 *
 * Run: npm run seed:pilots
 */
import { mergeIntoRegistry, mergeFromEvents } from "./lib/pilots";
import { PILOTS_PATH } from "./lib/paths";

const { added, updated, total } = mergeIntoRegistry();
console.log(`✓ histórico: ${added} nuevos, ${updated} actualizados, ${total} en total`);

const fromEvents = mergeFromEvents();
if (fromEvents.added > 0) {
  console.log(`✓ eventos SpeedHive: ${fromEvents.added} pilotos agregados (team/country vacíos):`);
  fromEvents.names.slice(0, 15).forEach((name) => console.log(`   - ${name}`));
  if (fromEvents.names.length > 15) {
    console.log(`   … y ${fromEvents.names.length - 15} más`);
  }
} else {
  console.log("✓ eventos SpeedHive: sin pilotos faltantes");
}
console.log(`Registro final: ${PILOTS_PATH.replace(process.cwd(), ".")}`);
