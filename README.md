This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Datos: fuentes de verdad

Solo dos cosas se editan a mano, ambas desde el panel `/admin`:

| Qué | Dónde vive | UI |
|---|---|---|
| **Asignación de equipo** de un piloto (`team` actual y `teams[año]`) | tabla Neon `pilots` → `src/data/pilots.json` | `/admin/pilots` |
| **Catálogo de equipos** (slug, nombre, logo, visible) | tabla Neon `teams` → `src/data/teams.json` | `/admin/teams` |

Todo lo demás se deriva: rosters de `/equipos/*`, columnas y logos de equipo en
las tablas de posiciones, estadísticas por equipo, links, búsqueda y breadcrumbs.
El `team` guardado en `src/data/history/**` es solo un *fallback* para pilotos
que no están en el registro — no se edita a mano.

Scripts relacionados:

- `npm run check:teams` — falla si hay inconsistencias (corre también en `prebuild`).
- `npm run registry:2026` — importa **altas** desde `CUMPLEAÑOS 2026.xlsx`; no pisa equipos existentes.
- `npm run db:export` — regenera los JSON desde Neon.

Cambiar a un piloto de equipo: `/admin/pilots` → no hace falta correr ningún script.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
