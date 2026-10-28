# Design Loop — POC de mejora iterativa

Rama: `feature/design-loop`. Cada iteración = una pasada de mejora con
skills, verificada (tsc + lint + build) y commiteada.

## Skills instaladas (en este repo)

| Skill | Fuente | Para qué |
|---|---|---|
| `refactoring-ui` | wondelai (basado en Refactoring UI) | Jerarquía, espaciado, escala, grayscale-first |
| `frontend-design` | anthropics | Identidad visual distintiva, anti-template |
| `landing-page-design` | elayadesign | Estructura y copy de landing, checklist de conversión |
| `microinteractions` | wondelai | Detalles de hover/focus/transiciones |
| `ui-ux-pro-max` | nextlevelbuilder | Auditoría UX por dominios |
| `web-design-guidelines` | vercel-labs | Checklist de interfaz web |
| `design-taste-frontend` | local | Anti-slop, dials de variance/motion |

## El loop

1. **Elegir objetivo** (página/sección de mayor impacto)
2. **Cargar skills** relevantes del objetivo
3. **Auditar** — score refactoring-ui (8 checks → /10) + anti-slop
4. **Aplicar** mejoras concretas (3-6 por iteración, no un rediseño total)
5. **Verificar**: `tsc && lint && build`
6. **Commit** descriptivo: `ux(loop-N): <objetivo> — <mejoras>`
7. Siguiente objetivo

## Registro de iteraciones

| # | Objetivo | Skills | Mejoras | Commit |
|---|---|---|---|---|
|0 | Setup:4 skills instaladas + registro | find-skills | `refactoring-ui`, `frontend-design`, `landing-page-design`, `microinteractions` | 572d968 |
| 1 | Landing — jerarquía y espaciado | refactoring-ui | Eyebrow "Pilotos" eliminado (regla1/3), CTA primario filled+sombras, gap paddock3→4, pit-board shadow-xl | e402e02 |
| 2 | Admin Resumen — estados y elevación | microinteractions, refactoring-ui | Skeleton con forma del layout (stagger), stat links lift+shadow+focus-visible | da1181d |
| 3 | /eventos detalle — jerarquía de acciones y feature de datos | refactoring-ui | CTA primario filled + ghost señal, vuelta más rápida destacada, empty state card | 5a160d9 |
| 4 | Ficha de piloto — jerarquía de stats | refactoring-ui | Stats identidad (full) vs carrera (compact+divisor), empty states con card | pendiente |

## Backlog de objetivos (orden sugerido)

1. Landing (hero + secciones) — el más visto
2. `/Campeonato` tablas (legibilidad de datos densos)
3. `/eventos` detalle
4. Ficha de piloto
5. Admin panel (fechas/inscripciones)
6. Global: tokens, focus states, prefers-reduced-motion audit
