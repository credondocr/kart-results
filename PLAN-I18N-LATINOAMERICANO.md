# Plan i18n — `/latinoamericano` (es + en)

Estado: **pendiente de ejecución** · Branch sugerido: `feature/latinoamericano-i18n`

## Decisiones cerradas

| Decisión | Elección |
|---|---|
| Idiomas | `es` (default) + `en` |
| Estrategia URL | Prefijo `/es/latinoamericano` y `/en/latinoamericano` |
| URL base sin prefijo | `/latinoamericano` → 307 según `Accept-Language` + cookie |
| Email de confirmación | Según idioma de la URL del form (2 templates Resend) |
| Admin (`/admin/latinoamericano`) | **Se queda en español** (no entra al scope) |
| Resto del sitio | Intacto — sin prefijos, `lang="es"` por defecto |

## Alcance (inventario de strings)

| Superficie | Strings | Nota |
|---|---|---|
| Página + componentes (hero, secciones, listas, counters) | ~70 | headings, copy, labels, aria-labels |
| Formulario (pasos, validación, éxito) | ~31 | bloque más pesado |
| API submit (mensajes de error visibles) | 8 | hoy se muestran `data.message` verbatim |
| Email (asunto + cuerpo) | ~15 | duplicado: `email.ts` + template en dashboard Resend |
| Metadata + OG image | ~8 | `generateMetadata` por locale + texto de la imagen |
| Admin | ~35 | **excluido** (queda en español) |

**No traducir:**
- "Latinoamericano" (marca), P1 Speedway, sponsors, nombres de equipos/categorías (valores almacenados en Sheets/Neon; `NO TENGO EQUIPO` se usa en regex de matching — traducir solo el *label* del `<option>`, nunca el valor)
- Nombres de países: ya salen de `Intl.DisplayNames` — solo pasarle el locale

## Arquitectura

```
/latinoamericano            → 307 según Accept-Language → /es/... o /en/...
/es/latinoamericano         → página real (fuente de contenido)
/en/latinoamericano         → misma página, diccionario EN
Resto del sitio             → sin cambios (lang="es")
```

- **`next-intl` solo como capa de traducción** (provider + ICU plurals/interpolation). El routing lo maneja **middleware propio** con matcher limitado *exclusivamente* a rutas de latinoamericano — nunca toca `/eventos`, `/en-vivo`, etc.
- El contenido vive en un **componente compartido**; `src/app/[locale]/latinoamericano/page.tsx` lo monta con `es`/`en` (`generateStaticParams` + `notFound()` para otros locale). La ruta actual `src/app/latinoamericano/page.tsx` pasa a ser redirect.
- **`<html lang>` dinámico**: el middleware inyecta header `x-locale` → root layout lo lee y setea `lang`.
- **Nav/Footer**: el link queda como `/latinoamericano` (marca, sin traducir) — el redirect lo resuelve. Cero cambios en Navbar.

## Fases

### 1. Infra (~1.5h)
- [ ] Instalar `next-intl`
- [ ] Crear `messages/es.json` + `messages/en.json` con namespace `latinoamericano.*` (~120 keys)
- [ ] Middleware: detect locale (`Accept-Language` + cookie) → redirect/route; inyectar header `x-locale`
- [ ] Root layout: `lang` dinámico desde el header; montar `NextIntlClientProvider`
- [ ] Mover página actual a componente compartido + crear `src/app/[locale]/latinoamericano/`
- [ ] `/latinoamericano` actual → redirect 307 al locale sugerido

### 2. Página + componentes (~1.5h)
- [ ] Headings, copy, CTAs, counters, countdown (Días/Horas → Days/Hours), ticker, empty states, aria-labels → `getTranslations` / `useTranslations`
- [ ] Centralizar `countryLabel(code, locale)` (hoy duplicado en `PreInscritosList.tsx` y `CountryWall.tsx` con `"es"` hardcodeado) → `Intl.DisplayNames([locale])`
- [ ] Plurals ICU: `{count} piloto registrado/s` reemplaza ternaries
- [ ] Voseo ES ("Asegurá", "Sos el #N") → EN neutro ("Register", "You're #N")

### 3. Formulario + API (~1h)
- [ ] Labels, placeholders, errores de validación, estados (Enviando…, éxito), WhatsApp share por locale
- [ ] API devuelve **`code`** en vez de mensaje: `missing_fields`, `invalid_email`, `invalid_country`, `captcha_failed`, `server_error` → el cliente traduce (evita pasar locale al server)
- [ ] `EQUIPOS`: valor guardado sigue siendo `"NO TENGO EQUIPO"`; solo se traduce el label visible

### 4. Email por idioma (~1h)
- [ ] El form está bajo `/es/` o `/en/` → manda `locale` en el POST
- [ ] `email.ts`: `locale=en` → template EN (`RESEND_TEMPLATE_LATINOAMERICANO_EN`) + asunto EN; fallback inline HTML bilingüe. `es` → template actual (id `395ac483-9583-42b4-b686-ce7d7c6a98de`)
- [ ] **Manual usuario**: crear template EN en Resend (HTML provisto por el código) con las mismas variables: `first_name`, `categoria`, `equipo`, `parrilla_url` — y agregar `RESEND_TEMPLATE_LATINOAMERICANO_EN` a `.env.local` + Vercel

### 5. Metadata + OG (~0.5h)
- [ ] `generateMetadata` por locale (title/description EN) + `alternates.languages` (hreflang)
- [ ] `opengraph-image` bajo `[locale]/` con variante EN ("Latin American Karting Championship")

### 6. Verify (~0.5h)
- [ ] `tsc && npm run lint && npm run build`
- [ ] Redirect por navegador con Accept-Language es/en
- [ ] Form completo en EN (validación, submit, éxito, WhatsApp)
- [ ] Email EN real
- [ ] **Regresión**: verificar que `/eventos`, `/en-vivo`, `/admin/*` y el resto no cambiaron de comportamiento

**Esfuerfo total estimado: ~5-6h**

## Riesgos / notas

- **Middleware matcher muy acotado** — si se escapa, rompe rutas del sitio; validar con prueba de que `/eventos` y `/en-vivo` no se tocan
- Hero background y datos de categorías de Sheets no se traducen (marcas / valores almacenados)
- El template EN de Resend es manual (fuera del repo) — mantenimiento dual de copy de email
- El combobox de países usa `world-countries` con `translations.spa` → fallback a `name.common` en EN
- El path `src/app/[locale]/` compite con rutas raíz existentes: la validación de locale (`es|en` → `notFound()`) debe ser el primer gate para no interferir con 404s normales
