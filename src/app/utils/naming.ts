/**
 * Normalización de nombres de pilotos — módulo HOJA (sin imports del
 * proyecto). Existe para poder resolver equipos desde cualquier lado
 * (data/history, scripts, registry) sin crear ciclos de imports:
 *
 *   data/history → pilotRegistry → naming   (no puede pasar por pilotHistory,
 *   porque pilotHistory importa data/history).
 */

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function nameMatches(pilotName: string, resultName: string): boolean {
  const a = normalizeName(pilotName);
  const b = normalizeName(resultName);
  return a === b || a.startsWith(b + " ") || b.startsWith(a + " ");
}

/** "2026" · "2024–2026" (contiguas) · "2024, 2026" (discontinuas) */
export function formatYears(years: string[]): string {
  if (years.length === 1) return years[0];
  const numbers = years.map(Number);
  const contiguous = numbers.every((n, i) => i === 0 || n === numbers[i - 1] + 1);
  if (contiguous) return `${years[0]}–${years[years.length - 1]}`;
  return years.join(", ");
}
