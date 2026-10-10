import { readFile } from "fs/promises";
import { join } from "path";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  ink: "#070A14",
  surface: "#0F1322",
  text: "#E8EAF2",
  dim: "#9BA3BD",
  signal: "#4C8DFF",
  gold: "#E8B84B",
};

/**
 * Archivo Bold local (sin fetch en runtime) para las OG images.
 * Ruta relativa al cwd: import.meta.url no es file:// bajo Turbopack.
 */
export async function archivoFont() {
  const data = await readFile(join(process.cwd(), "src/app/assets/archivo-bold.ttf"));
  return { name: "Archivo", data, weight: 700 as const };
}
