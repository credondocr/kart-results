/** Datos y helpers del evento Latinoamericano de Karting 2027 — IV Edición (client-safe). */

export const EVENT = {
  name: "Campeonato Latinoamericano de Karting",
  shortName: "Latinoamericano",
  edition: "IV Edición",
  year: 2027,
  datesShort: "7 – 9 de mayo",
  datesLong: "7, 8 y 9 de mayo de 2027",
  circuit: "P1 Speedway",
  location: "Costa Rica",
  /** Countdown al día de apertura. */
  startsAt: "2027-05-07T08:00:00-06:00",
  mapQuery: "P1 Speedway, Costa Rica",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=P1+Speedway+Costa+Rica",
  wazeUrl: "https://waze.com/ul?ll=9.96190520%2C-84.13386430&navigate=yes",
  mapEmbed:
    "https://maps.google.com/maps?q=P1%20Speedway%20Costa%20Rica&t=&z=14&ie=UTF8&iwloc=&output=embed",
  reglamentoHref: "/content/RP LATINOAMERICANO  VORTEX-TILLOTSON 2025.pdf",
  poster: "/media/eventos/latinoamericano-iv-edicion-2027.jpeg",
} as const;

export type PreRegistro = {
  nombre: string;
  nacionalidad: string;
  categoria: string;
  equipo: string;
};

/** Familias de categorías (mismos values que la hoja de Google). */
export const CATEGORIA_FAMILIAS: { id: string; label: string; items: readonly string[] }[] = [
  {
    id: "iniciacion",
    label: "Iniciación",
    items: ["Kid Kart", "Stars of Tomorrow"],
  },
  {
    id: "rok",
    label: "Rok",
    items: ["Micro Rok", "Mini Rok", "Rok Shifter", "Rok Shifter Master"],
  },
  {
    id: "tillotson",
    label: "Tillotson",
    items: ["Tillotson Junior", "Tillotson Senior", "Tillotson Heavy", "Tilli Mini"],
  },
  {
    id: "vlr",
    label: "VLR",
    items: ["VLR- Junior", "VLR- Senior", "VLR- Master"],
  },
];

export const TODAS_CATEGORIAS: string[] = CATEGORIA_FAMILIAS.flatMap((f) => [...f.items]);

/** Orden canónico para listados (hoja → UI). */
export const ORDEN_CATEGORIAS: readonly string[] = [
  "Kid Kart",
  "Micro Rok",
  "Mini Rok",
  "Stars of Tomorrow",
  "Tillotson Junior",
  "Tillotson Senior",
  "Tillotson Heavy",
  "Tilli Mini",
  "VLR- Junior",
  "VLR- Senior",
  "VLR- Master",
  "Rok Shifter",
  "Rok Shifter Master",
];

export const EQUIPOS: readonly string[] = [
  "NO TENGO EQUIPO",
  "ADVANCED KARTING",
  "TDR-Babyliss Pro",
  "BRAUTIGAM RACING TEAM",
  "DR RACING KART COSTA RICA",
  "FMV",
  "FORMULA KART",
  "FSA (FIK SPORT ACADEMY)",
  "MH KARTING",
  "VALERIO RACING SYSTEM",
  "VRT4",
];

/** Cupos por categoría (vacío = sin límite; barras relativas al máximo). */
export const CUPOS: Record<string, number> = {};

export function normalizarCategoria(c: string): string {
  return (c || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function etiquetaCategoria(raw: string): string {
  const t = (raw || "").trim().replace(/\s+/g, " ");
  if (!t) return t;
  const key = normalizarCategoria(t);
  return ORDEN_CATEGORIAS.find((o) => normalizarCategoria(o) === key) ?? t;
}

/** Clave de dedupe por nombre (sin diacríticos, minúsculas). */
export function nombreClave(nombre: string): string {
  return String(nombre ?? "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Deja una sola fila por nombre; conserva el orden dado. */
export function dedupePorNombre(items: PreRegistro[]): PreRegistro[] {
  const seen = new Set<string>();
  const out: PreRegistro[] = [];
  for (const s of items) {
    const key = nombreClave(s.nombre);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

const NO_TENGO_EQUIPO = /^no tengo equipo$/i;

/** Sufijo " - equipo" para listados; vacío si no aplica. */
export function sufijoEquipo(equipo?: string): string {
  const t = (equipo || "").trim();
  if (!t || NO_TENGO_EQUIPO.test(t)) return "";
  return ` — ${t}`;
}

/** Índice de posición (1-based) de un nombre dentro de la lista deduplicada. */
export function posicionDe(submissions: PreRegistro[], nombre: string): number {
  const key = nombreClave(nombre);
  const i = submissions.findIndex((s) => nombreClave(s.nombre) === key);
  return i >= 0 ? i + 1 : submissions.length + 1;
}
