import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";

export const HISTORY_ROOT = fileURLToPath(new URL("../../src/data/history", import.meta.url));
export const HISTORY_INDEX = fileURLToPath(new URL("../../src/data/history/index.ts", import.meta.url));
export const PILOTS_PATH = fileURLToPath(new URL("../../src/data/pilots.json", import.meta.url));
export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

export function seasonIndexPath(year: string | number, season: string): string {
  return `${HISTORY_ROOT}/${year}/${season}/index.ts`;
}

export function classFilePath(year: string | number, season: string, folder: string): string {
  return `${HISTORY_ROOT}/${year}/${season}/${folder}/index.ts`;
}
