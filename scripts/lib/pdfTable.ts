import { readFileSync } from "fs";

export interface TextItem {
  x: number;
  y: number;
  w: number;
  text: string;
  fontSize: number;
}

export interface TableRow {
  y: number;
  items: TextItem[];
}

const Y_TOLERANCE = 4;

function groupByY(items: TextItem[]): TableRow[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: TableRow[] = [];
  for (const item of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(item.y - last.y) <= Y_TOLERANCE) {
      last.items.push(item);
    } else {
      rows.push({ y: item.y, items: [item] });
    }
  }
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
  }
  return rows;
}

export async function extractRows(pdfPath: string): Promise<TableRow[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  try {
    const allRows: TableRow[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const items: TextItem[] = [];
      for (const raw of content.items) {
        if (!("str" in raw) || !raw.str.trim()) continue;
        const t = raw.transform;
        items.push({
          x: t[4],
          y: t[5],
          w: raw.width ?? 0,
          text: raw.str,
          fontSize: Math.abs(t[3]) || Math.abs(t[0]),
        });
      }
      allRows.push(...groupByY(items));
      page.cleanup();
    }
    return allRows;
  } finally {
    await doc.destroy();
  }
}
