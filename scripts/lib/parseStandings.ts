import type { TableRow, TextItem } from "./pdfTable";

export interface StandingRow {
  pos: number;
  number: number | string;
  name: string;
  scores: number[];
  total: number;
}

export interface ParsedStandings {
  title: string;
  seasonLabel: string | null;
  year: number | null;
  season: string | null;
  eventLabels: string[];
  rows: StandingRow[];
}

export class ParseError extends Error {}

type CellKey = "pos" | "number" | "name" | "total" | "diff" | "gap" | `event:${number}`;

interface Column {
  key: CellKey;
  cx: number;
}

const NUMERIC_RE = /^-?\d+(?:[.,]\d+)?$/;
const INTEGER_RE = /^\d+$/;
const KART_NUMBER_RE = /^\d+[a-z]+$/i;
const SEASON_RE = /^(verano|invierno)\s+(\d{4})\b/i;

function parseNumber(text: string): number | null {
  const t = text.trim();
  if (!NUMERIC_RE.test(t)) return null;
  return parseFloat(t.replace(",", "."));
}

function isAbsentMark(text: string): boolean {
  return text.trim().toLowerCase() === "x";
}

function rowText(row: TableRow): string {
  return row.items
    .map((i) => i.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function findHeaderIndex(rows: TableRow[]): number {
  return rows.findIndex((row) =>
    row.items.some((i) => /^pos\.?$/i.test(i.text.trim())) &&
    row.items.some((i) => /^name$/i.test(i.text.trim()))
  );
}

function headerItem(row: TableRow, re: RegExp): TextItem | undefined {
  return row.items.find((i) => re.test(i.text.trim()));
}

function centerOf(item: TextItem): number {
  return item.x + item.w / 2;
}

/** Builds the column layout from the header row plus the optional #1 #2 sub-header row. */
function buildColumns(header: TableRow, subHeader: TableRow | null): { columns: Column[]; eventCount: number; hasSeasonTotal: boolean; boundaryCx: number } {
  const pos = headerItem(header, /^pos\.?$/i);
  const number = headerItem(header, /^no\.?$/i);
  const name = headerItem(header, /^name$/i);
  if (!pos || !number || !name) {
    throw new ParseError(
      `No se encontró la fila de encabezados (Pos/No./Name). Encabezado real: "${rowText(header)}"`
    );
  }

  const afterName = header.items.filter((i) => i.x > name.x && i.text.trim() !== "");
  const totalHeaders = afterName.filter((i) => /^total$/i.test(i.text.trim()));
  if (totalHeaders.length === 0) {
    throw new ParseError(`No se encontró la columna "Total". Encabezado: "${rowText(header)}"`);
  }

  const subEvents = subHeader
    ? subHeader.items.filter((i) => /^#\d+$/.test(i.text.trim()))
    : [];

  // Standard layout: first "Total" is the season total, the rest are per-event columns.
  let hasSeasonTotal = true;
  let eventCount = totalHeaders.length - 1;
  if (subEvents.length > 0) {
    if (subEvents.length === totalHeaders.length) {
      hasSeasonTotal = false;
      eventCount = subEvents.length;
    } else if (subEvents.length !== totalHeaders.length - 1) {
      throw new ParseError(
        `Columnas inconsistentes: ${subEvents.length} eventos (#N) vs ${totalHeaders.length} columnas "Total"`
      );
    }
  }
  if (eventCount < 1) {
    throw new ParseError("No se detectaron columnas de fechas (#1, #2, ...) en el PDF");
  }

  const columns: Column[] = [
    { key: "pos", cx: centerOf(pos) },
    { key: "number", cx: centerOf(number) },
    { key: "name", cx: centerOf(name) },
  ];
  if (hasSeasonTotal) {
    columns.push({ key: "total", cx: centerOf(totalHeaders[0]) });
  }
  const diff = afterName.find((i) => /^diff$/i.test(i.text.trim()));
  const gap = afterName.find((i) => /^gap$/i.test(i.text.trim()));
  if (diff) columns.push({ key: "diff", cx: centerOf(diff) });
  if (gap) columns.push({ key: "gap", cx: centerOf(gap) });
  const eventHeaders = hasSeasonTotal ? totalHeaders.slice(1) : totalHeaders;
  eventHeaders.forEach((h, idx) => columns.push({ key: `event:${idx}`, cx: centerOf(h) }));

  return { columns, eventCount, hasSeasonTotal, boundaryCx: centerOf(afterName[0]) };
}

function assignColumn(item: TextItem, columns: Column[], boundaryCx: number): CellKey {
  const text = item.text.trim();
  const numericLike = NUMERIC_RE.test(text) || KART_NUMBER_RE.test(text) || isAbsentMark(text);
  const hasName = columns.some((c) => c.key === "name");

  // Free text before the first numeric column belongs to the driver name cell.
  if (!numericLike && hasName && item.x < boundaryCx) {
    return "name";
  }

  const cx = centerOf(item);
  let best = columns[0];
  let bestDist = Infinity;
  for (const col of columns) {
    const dist = Math.abs(cx - col.cx);
    if (dist < bestDist) {
      bestDist = dist;
      best = col;
    }
  }
  return best.key;
}

function parseDataRows(rows: TableRow[], headerIdx: number, subHeaderIdx: number, columns: Column[], eventCount: number, hasSeasonTotal: boolean, boundaryCx: number): StandingRow[] {
  const results: StandingRow[] = [];

  for (let r = 0; r < rows.length; r++) {
    if (r === headerIdx || r === subHeaderIdx) continue;
    const row = rows[r];

    const cells = new Map<CellKey, string[]>();
    for (const item of row.items) {
      const key = assignColumn(item, columns, boundaryCx);
      const list = cells.get(key) ?? [];
      list.push(item.text);
      cells.set(key, list);
    }

    const posText = (cells.get("pos") ?? []).join("").trim();
    const numberText = (cells.get("number") ?? []).join("").trim();
    if (!INTEGER_RE.test(posText)) continue; // legend/footer/other non-data rows
    if (!INTEGER_RE.test(numberText) && !KART_NUMBER_RE.test(numberText)) {
      throw new ParseError(`Fila con posición "${posText}" sin número de kart válido: "${rowText(row)}"`);
    }
    const number = INTEGER_RE.test(numberText) ? parseInt(numberText, 10) : numberText;

    const name = (cells.get("name") ?? [])
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (!name) {
      throw new ParseError(`Fila ${posText} sin nombre de piloto: "${rowText(row)}"`);
    }

    const scores: number[] = [];
    for (let i = 0; i < eventCount; i++) {
      const cell = (cells.get(`event:${i}`) ?? []).join("").trim();
      if (cell === "" || isAbsentMark(cell)) {
        scores.push(0);
        continue;
      }
      const value = parseNumber(cell);
      if (value === null) {
        throw new ParseError(`Valor no numérico en la fecha #${i + 1} de "${name}": "${cell}"`);
      }
      scores.push(value);
    }

    const sum = scores.reduce((acc, s) => acc + s, 0);
    let total = sum;
    if (hasSeasonTotal) {
      const cell = (cells.get("total") ?? []).join("").trim();
      if (cell !== "") {
        const value = parseNumber(cell);
        if (value === null) {
          throw new ParseError(`Total no numérico para "${name}": "${cell}"`);
        }
        if (Math.abs(value - sum) > 0.001) {
          throw new ParseError(
            `Total inconsistente para "${name}": PDF dice ${value} pero la suma de fechas da ${sum}`
          );
        }
        total = value;
      }
    }

    results.push({ pos: parseInt(posText, 10), number, name, scores, total });
  }

  if (results.length === 0) {
    throw new ParseError("No se encontraron filas de resultados en el PDF");
  }
  return results;
}

function validatePositions(rows: StandingRow[]): void {
  const seen = new Set<number>();
  for (const row of rows) {
    if (seen.has(row.pos)) {
      throw new ParseError(`Posición duplicada en el PDF: ${row.pos}`);
    }
    seen.add(row.pos);
  }
  for (let i = 1; i <= rows.length; i++) {
    if (!seen.has(i)) {
      throw new ParseError(`Falta la posición ${i} en el PDF (posiciones deben ser 1..${rows.length})`);
    }
  }
}

function detectTitle(rows: TableRow[]): { title: string; titleIdx: number } {
  let bestIdx = -1;
  let bestFs = -1;
  for (let i = 0; i < rows.length; i++) {
    for (const item of rows[i].items) {
      if (item.fontSize > bestFs) {
        bestFs = item.fontSize;
        bestIdx = i;
      }
    }
  }
  if (bestIdx >= 0) {
    return { title: rowText(rows[bestIdx]), titleIdx: bestIdx };
  }
  for (const row of rows) {
    const m = rowText(row).match(/Championship Standings of (.+?)(?:Printed|$)/i);
    if (m) {
      return { title: m[1].trim(), titleIdx: rows.indexOf(row) };
    }
  }
  throw new ParseError("No se encontró el título de la categoría en el PDF");
}

function detectSeasonLabel(rows: TableRow[], titleIdx: number): string | null {
  const next = rows[titleIdx + 1];
  if (!next) return null;
  const text = rowText(next);
  return text && !/^#\d/.test(text) ? text : null;
}

function detectEventLabels(rows: TableRow[], eventCount: number): string[] {
  const labels: string[] = [];
  for (const row of rows) {
    const markers = row.items.filter((i) => /^#\d+$/.test(i.text.trim()));
    for (const marker of markers) {
      const idx = parseInt(marker.text.trim().slice(1), 10) - 1;
      if (idx < 0 || idx >= eventCount || labels[idx]) continue;
      const label = row.items
        .filter((i) => i.x > marker.x)
        .map((i) => i.text.trim())
        .find((t) => /fecha/i.test(t));
      if (label) labels[idx] = label;
    }
  }
  return Array.from({ length: eventCount }, (_, i) => labels[i] ?? `#${i + 1}`);
}

export function parseStandings(rows: TableRow[]): ParsedStandings {
  const headerIdx = findHeaderIndex(rows);
  if (headerIdx < 0) {
    throw new ParseError("No se encontró la tabla de posiciones (falta el encabezado Pos/Name)");
  }

  // The #1 #2 sub-header sits directly above the main header row.
  const subHeaderIdx = headerIdx > 0 && rows[headerIdx - 1].items.some((i) => /^#\d+$/.test(i.text.trim()))
    ? headerIdx - 1
    : -1;
  const subHeader = subHeaderIdx >= 0 ? rows[subHeaderIdx] : null;

  const { columns, eventCount, hasSeasonTotal, boundaryCx } = buildColumns(rows[headerIdx], subHeader);
  const dataRows = parseDataRows(rows, headerIdx, subHeaderIdx, columns, eventCount, hasSeasonTotal, boundaryCx);
  validatePositions(dataRows);
  dataRows.sort((a, b) => a.pos - b.pos);

  const { title, titleIdx } = detectTitle(rows);
  const seasonLabel = detectSeasonLabel(rows, titleIdx);
  const seasonMatch = seasonLabel?.match(SEASON_RE);

  return {
    title,
    seasonLabel,
    year: seasonMatch ? parseInt(seasonMatch[2], 10) : null,
    season: seasonMatch ? seasonMatch[1].toLowerCase() : null,
    eventLabels: detectEventLabels(rows, eventCount),
    rows: dataRows,
  };
}
