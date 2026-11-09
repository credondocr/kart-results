# AGENTS.md

Guía para tomar decisiones en este repo (kart-results · CRKC · `resultados.acekcr.com`).
Stack: **Next.js 15 App Router + React 19 + TS**, deploy en **Vercel**, datos en **Neon (Postgres)**.
Mensajes de commit en español, prefijo convencional: `data:`, `feat:`, `fix:`, `ux:`, `chore:`.

## Fuentes de verdad (regla de oro)

Solo dos cosas se editan a mano, siempre desde el panel `/admin` (tablas Neon):

| Qué | Tabla Neon | JSON derivado | UI |
|---|---|---|---|
| Asignación de equipo de un piloto (`team` actual + `teams[año]`) | `pilots` | `src/data/pilots.json` | `/admin/pilots` |
| Catálogo de equipos (slug, nombre, logo, visible) | `teams` | `src/data/teams.json` | `/admin/teams` |

- En **Vercel** el `prebuild` exporta DB → JSON (`dbExportPilots`, `dbExportTeams`,
  `dbExportPenalties`, `build-history`, `check-teams`). **Editar JSON a mano en el repo
  se sobrescribe en el próximo deploy** → los cambios de pilotos/equipos van por
  `/admin` o por scripts que hacen upsert a la DB.
- Local: `npm run db:export -- --force` regenera los JSON desde la DB.
  Round-trip check: después de correrlo, `git diff src/data/*.json` debe quedar vacío.
  *Efecto secundario:* reescribe `public/logos/*.png` desde los blobs `logo_png` de la
  DB (si no es deseado, `git checkout -- public/logos/`).
- `npm run seed:pilots` / `db:seed` solo **insertan faltantes** (nunca pisan filas existentes).

## Equipos

- **Slug = identificador canónico** (`fmv`, `fsa`, `advanced`, `valerio`, `dr-racing`,
  `formula`, `mhkarting`, `independiente`, `vrt4`, `losprimos`, `akm`, `unknown`).
  `TeamLogo` renderiza `/logos/{slug}.png` con placeholder en onError → nunca inventes
  slugs fuera del catálogo (los valida `check:teams`).
- **Resolución en runtime** (`src/app/utils/pilotRegistry.ts`, módulo hoja):
  - `currentTeamOf(name)` → equipo actual (registro).
  - `teamForYear(name, year)` → equipo de temporada; fallback al `team` guardado en
    `src/data/history/**` solo si el piloto no tiene ficha en el registro.
  - `resolveLeaderboardTeams()` (`src/app/utils/common.ts`) aplica `teamForYear` a cada
    fila de standings al construirlos (`addTeamsCategory`, `generateGeneralLeaderboard`,
    `buildIndex`, stats). **El `team` en history/** es fallback, no se edita a mano.**
- `pilotRegistry.ts` y `naming.ts` son hojas (solo importan el JSON) para evitar ciclos:
  `data/history → pilotRegistry → naming` — no agregar imports circulares ahí.
- **Equipo nuevo de verdad:** insertar fila en la tabla `teams` (+ logo en
  `public/logos/<slug>.png`) vía `/admin/teams`, luego `db:export`.
- Alias de nombres de equipo en el Excel de rosters (`TEAM_MAP` de
  `scripts/update-registry-2026.ts`): `TDR - BABYLISS PRO → losprimos` (mismo equipo
  renombrado), `FSA (FIK SPORT ACADEMY) → fsa`, `DR RACING KART COSTA RICA → dr-racing`, etc.
- Guard: `npm run check:teams` (corre en prebuild). **Errores** (exit 1): equipo actual
  fuera del catálogo, piloto en 2 páginas de equipo, ficha de roster que no resuelve.
  **Avisos**: `teams[año]` fuera del catálogo (dato histórico, ej. `epson`), perfiles
  `src/data/drivers/*` con `teamLogo` desalineado (~26, pendiente "Fase 2").

## Registro de pilotos (`src/data/pilots.json`)

```jsonc
"alan salazar": {                    // key = normalizeName(nombre) — única, sin acentos
  "name": "Alan Salazar",            // nombre canónico de display
  "team": "fmv",                     // equipo ACTUAL (plano)
  "teams": { "2025": "fmv", "2026": "fmv" },  // por temporada
  "country": "CR",
  "aliases": ["Alan Salazar Ruiz"],  // otras grafías aceptadas al matchear
  "birthDate": "2009-11-01",         // YYYY-MM-DD, solo si se conoce
  "categories": ["VLR Senior"]       // grafía canónica del campeonato
}
```

- **Match de nombres:** exacto (key/alias) → prefijo único. Prefijo ambiguo = sin match.
  Dos personas distintas con el mismo nombre **no caben en una key** → crear dos keys
  distintas + aliases (caso resuelto: `sebastian arce` = García / `sebastian recinos`).
- **Flujos de importación de rosters:**
  - `npm run import:inscritos -- "<archivo.xlsx>" [--apply] [--year 2026]` — planilla
    oficial de inscritos (nombre, nacimiento, categoría, equipo). Sin `--apply` solo
    reporte; con `--apply` upsert a DB + `db:export`. No importa PII (cédula, teléfonos…).
    Match por `samePerson` (fuzzy 0.7) — vigilar falsos merges.
  - `npm run registry:2026 -- [--dry-run|--push-db]` — `CUMPLEAÑOS 2026.xlsx`:
    **solo ALTAS** (pilotos nuevos + completar `birthDate` que falte). **No pisa equipos
    existentes** — las diferencias se reportan como "drift" y se editan en `/admin/pilots`.
    Contiene decisiones de mapeo hardcodeadas (merges, filas descartadas) — leer el
    header del script antes de tocarlo.

## Importación de scores / standings

Cadena de datos de carreras:

```
SpeedHive API ──import:event──▶ src/data/events/<id>.json + manifest.json   (datos crudos por sesión)
PDF standings  ──import:standings──▶ src/data/history/<year>/<season>/<clase>/index.ts  (tabla del campeonato)
                                     └─ se resuelven equipos en runtime desde el registro
```

1. **Eventos SpeedHive** — `npm run import:event -- <id>` · `--all-crkc` (pendientes) ·
   `--manifest` (regenera manifest sin red). API: `eventresults-api.speedhive.com/v2`.
   Salida: `src/data/events/` (clasificaciones por sesión, vueltas rápidas, fechas).
2. **Standings del campeonato (por PDF, uno por categoría)** —
   `npm run import:standings -- "<archivo.pdf>" [opciones]`:
   - Detecta año/temporada del subtítulo del PDF; `--year/--season` para forzar.
   - Matchea la clase por título (`--class <folder>` si es ambiguo) y la categoría
     (`--category`); ejemplo real: *"T4 Tilly Mini"* → `--class tillotson --category "MINI T4"`.
   - `--dry-run` imprime la tabla antes de escribir · `--fechas <n>` rellena columnas ·
     `--allow-unknown` acepta pilotos sin ficha (queda team vacío).
   - Escribe con `serializeClass` (formato canónico: un cambio chico en un archivo
     con formato compacto produce un diff grande — es esperado).
   - **Los PDF no se commitean** (inputs locales, fuera del repo desde `4bf415b`).
   - Requiere que los pilotos existan en el registro (o `--allow-unknown`).
3. **Histórico 2019-2023** — `npm run history:build [-- <año>]` regenera desde los
   eventos + `src/data/penalties.json` con escalas oficiales CRKC
   (QUALI `5…1`, PREFINAL `12.5…0.5`, FINAL `25…1`). **Cuidado:** reescribe
   `src/data/history/2019..2023` — no correr con ediciones manuales sin commitear ahí.
4. **Penalizaciones** — tabla Neon → `src/data/penalties.json` (`db:export`); las aplica
   `history:build`.
5. **QA de puntos** — `npm run validate:points` · `analyze:points` · `points-table`.
6. **Renders con equipo:** tablas de standings usan `resolveLeaderboardTeams` (runtime);
   clasificación de `/eventos/[id]` y perfil leen el registro directo
   (`lookupRegistry`/`currentTeamOf`). `campeones`/`estadisticas` resuelven con
   `teamForYear` (equipo de la temporada, no el actual) — es intencional.

## Comandos

```bash
npm run dev                 # next dev --turbopack
npx tsc --noEmit            # typecheck (rápido)
npm run lint                # eslint
npm run check:teams         # consistencia de equipos
npm run db:export -- --force  # JSON ← DB (round-trip check)
npx next build              # build SIN prebuild (ver gotcha abajo)
npm run build               # build CON prebuild (exports + build-history + check:teams)
```

## Verificación antes de un commit de datos

1. `npx tsc --noEmit` + `npm run lint`
2. `npm run check:teams`
3. Round-trip: `npm run db:export -- --force` → `git diff src/data/` vacío
4. Imports: correr siempre `--dry-run` primero y revisar el reporte
5. `git status` → **stagear solo tus archivos** (ver gotchas paralelos)

## Gotchas

- **Excel fechas:** extraer con componentes LOCALES (`getFullYear/getMonth/getDate`);
  `toISOString()` con medianoche da off-by-one (+1 día). Varias fechas ya existentes en
  el registro tienen ese bug (ej. Thomas Hof 11-06 vs real 11-05) — no pisar sin querer.
- **Trabajo en paralelo:** el dueño suele tener cambios/commits simultáneos en el
  working tree → revisa `git status` y **no stagees archivos ajenos** (PDFs, fotos,
  `.gitignore`, otros `history/*`).
- **zsh:** comillas obligatorias con corchetes/ñ:
  `git add "src/app/Campeonato/[year]/[season]/page.tsx" "CUMPLEAÑOS 2026.xlsx"`.
- **`npm run build` dispara prebuild** → exporta DB, reescribe logos y regenera
  2019-2023. Para solo verificar compilación: `npx next build`.
- **jsonb** ordena claves por longitud → años (4 dígitos) quedan cronológicos; los
  exports son estables.
- **Nombres repetidos en el Excel** (duplicados/conflictos): resolver a mano con el
  usuario antes de aplicar; el script `registry:2026` tiene la lista de decisiones
  (discards + merges) documentada en su header.
- **GA4:** `G-LPK6W05FXS` hardcodeado en `src/app/components/GoogleAnalytics.tsx`;
  falta pageview en navegación SPA (App Router no recarga) — plan sin implementar.

## Pendientes conocidos

- Perfiles `src/data/drivers/*` con `teamLogo` desalineado (~26 avisos de `check:teams`,
  "Fase 2": drivers/* dejaría de tener equipo).
- `teams[2025]: "epson"` en registro no existe en el catálogo (aviso).
- Branch `feature/t4-tilly-mini-fecha4-pdf` contiene un PDF duplicado (contenido de la
  Fecha 3) — necesita el PDF real de Fecha 4 o eliminar el branch.
- Tracking GA4 completo (env var + pageviews SPA + eventos personalizados) planificado,
  no implementado.

## Mapa rápido

```
src/app/                    # rutas App Router (layout.tsx = HTML shell, monta GoogleAnalytics)
src/app/utils/              # pilotRegistry, naming (hojas), common (resolveLeaderboardTeams),
                            # pilotHistory, pilotLinks, pilotProfile, teamRoster, eventData
src/data/pilots.json        # registro de pilotos  ← tabla Neon pilots
src/data/teams.json         # catálogo de equipos   ← tabla Neon teams
src/data/history/<y>/<s>/   # standings por clase (import:standings / history:build)
src/data/events/            # eventos SpeedHive crudos (import:event) + manifest.json
src/data/drivers/           # perfiles estáticos con fotos (falta alinear equipos)
scripts/                    # todos los imports/exports (ver package.json)
.env.local                  # POSTGRES_URL (Neon) — nunca commitear
```
