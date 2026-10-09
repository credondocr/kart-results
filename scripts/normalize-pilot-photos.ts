/**
 * Normaliza las fotos de pilotos/ a WebP para la web y genera el manifiesto
 * que usa la app para resolver la foto de cada piloto.
 *
 *   entrada:  pilotos/<Categoría>/<Nombre>-<número>.png
 *   salida:   public/pilotos/<clave>.webp  (ancho máx 400, calidad 82)
 *   manifiesto: src/data/pilotPhotos.json  (clave → archivo)
 *
 * Correr: npm run photos:normalize
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { basename, extname, join } from "path";
import sharp from "sharp";
import { normalizeName } from "../src/app/utils/pilotHistory";
import { REPO_ROOT } from "./lib/paths";
import { Drivers } from "../src/data/drivers/data";
import { getHistoryPilots } from "../src/app/utils/pilotHistory";

const INPUT_DIR = join(REPO_ROOT, "pilotos");
const OUTPUT_DIR = join(REPO_ROOT, "public", "pilotos");
const MANIFEST_PATH = join(REPO_ROOT, "src", "data", "pilotPhotos.json");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".heic"]);

/** Typos en nombres de archivo → clave real del piloto (sin tocar el original). */
const KEY_ALIASES: Record<string, string> = {
  "felipe-frasser": "felipe-fraser",
  "zachary-briedgeman": "zachary-bridgeman",
  "jose-alejandro-halpen": "jose-a-halphen",
};

export function photoKey(name: string): string {
  // Insensible a acentos, mayúsculas y puntuación ("José A. Halphen" → "jose-a-halphen")
  return normalizeName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...collectFiles(path));
    } else if (IMAGE_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files.push(path);
    }
  }
  return files;
}

/** "Julian De Oliva-18 .png" → "Julian De Oliva" */
function nameFromFilename(file: string): string {
  return basename(file, extname(file))
    .replace(/-\d+\s*$/, "")
    .trim();
}

function matchesName(key: string, pilotName: string): boolean {
  const photoName = key.replace(/-/g, " ");
  const target = normalizeName(pilotName).replace(/[^a-z0-9]+/g, " ").trim();
  return photoName === target || photoName.startsWith(target + " ") || target.startsWith(photoName + " ");
}

async function main(): Promise<void> {
  if (!statSync(INPUT_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`No existe la carpeta de entrada: ${INPUT_DIR}`);
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = collectFiles(INPUT_DIR);
  const manifest: Record<string, string> = {};
  const duplicates: string[] = [];
  const unparseable: string[] = [];
  let inputBytes = 0;
  let outputBytes = 0;

  for (const file of files.sort()) {
    const name = nameFromFilename(file);
    if (!name) {
      unparseable.push(file);
      continue;
    }
    const key = photoKey(name);
    if (!key) {
      unparseable.push(file);
      continue;
    }
    const finalKey = KEY_ALIASES[key] ?? key;
    if (manifest[finalKey]) {
      duplicates.push(`${finalKey} ← ${file.replace(REPO_ROOT + "/", "")}`);
      continue;
    }

    const outFile = `${finalKey}.webp`;
    await sharp(file)
      .rotate() // respeta EXIF
      .resize({ width: 400, height: 520, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(join(OUTPUT_DIR, outFile));

    manifest[finalKey] = outFile;
    inputBytes += statSync(file).size;
    outputBytes += statSync(join(OUTPUT_DIR, outFile)).size;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  // Reporte: qué fotos no matchean a ningún piloto conocido
  const knownNames = [
    ...Drivers.map((driver) => driver.name),
    ...getHistoryPilots().map((pilot) => pilot.name),
  ];
  const unmatched = Object.keys(manifest).filter(
    (key) => !knownNames.some((name) => matchesName(key, name))
  );

  const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + " MB";
  console.log(`✓ ${Object.keys(manifest).length} fotos → public/pilotos/ (${mb(inputBytes)} → ${mb(outputBytes)})`);
  console.log(`✓ Manifiesto: ${MANIFEST_PATH.replace(REPO_ROOT + "/", "")}`);
  if (duplicates.length > 0) {
    console.log(`\nDuplicados (se conservó la primera):`);
    duplicates.forEach((entry) => console.log(`  - ${entry}`));
  }
  if (unmatched.length > 0) {
    console.log(`\nFotos sin piloto conocido (revisa el nombre del archivo):`);
    unmatched.forEach((key) => console.log(`  - ${key}`));
  }
  if (unparseable.length > 0) {
    console.log(`\nArchivos sin nombre parseable:`);
    unparseable.forEach((file) => console.log(`  - ${file.replace(REPO_ROOT + "/", "")}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
