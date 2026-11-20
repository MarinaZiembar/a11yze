# A11yze

Analizador de accesibilidad web: pegás una URL y obtenés un reporte en **mobile y desktop**, organizado según los principios de la W3C (perceptible, operable, comprensible, robusto). Bilingüe ES / EN.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4

## Cómo funciona

- `app/api/analyze/route.ts` llama a la API de **Google PageSpeed Insights** con `category=ACCESSIBILITY`, dos veces en paralelo (`strategy=mobile` y `strategy=desktop`). PSI corre Lighthouse (que usa axe-core) sobre la página real.
- `lib/psi.ts` normaliza el resultado de Lighthouse: estado de cada regla, elementos afectados (snippet + explicación) y link a la documentación.
- `lib/categories.ts` agrupa las reglas en 9 categorías + una de **revisión manual**, con el texto en ES/EN de qué se analiza, estrategias y recursos (W3C WAI, WCAG 2.2, WebAIM). Las reglas nuevas de Lighthouse que no estén mapeadas caen en una categoría por su grupo, así no se pierden.
- El resultado queda en `sessionStorage`, así las páginas `/check/[id]` funcionan aunque recargues.

## Correr local

```bash
npm install
cp .env.example .env.local   # pegá tu PSI_API_KEY
npm run dev
```

### API key (recomendada)

Sin clave, PSI usa una cuota compartida que se agota rápido (error 429). La clave es gratuita:
https://developers.google.com/speed/docs/insights/v5/get-started → "Get a key". En Vercel, cargala como variable de entorno `PSI_API_KEY`.

## Deploy

Deployado en Netlify (Next.js se detecta solo; ver `netlify.toml`). La ruta `/api/analyze` corre como función con límite de 60 s; cada corrida de Lighthouse tiene timeout de 55 s. Cargá `PSI_API_KEY` en Netlify → Project configuration → Environment variables (scope: Functions).

## Personalizar

- Contacto del footer: `lib/site.ts`
- Textos de la interfaz: `lib/i18n.tsx`
- Contenido de cada categoría: `lib/categories.ts`
- Paleta y animaciones: `app/globals.css` (todas se desactivan con `prefers-reduced-motion`)

## Accesibilidad de la propia app

Skip link, foco visible de alto contraste, `<html lang>` que cambia con el idioma, controles con `aria-pressed`, regiones scrolleables enfocables, mensajes de carga con `aria-live`, colores verificados para AA (en las cards naranjas el texto es siempre oscuro).

## Límites

El análisis automático detecta solo una parte de los problemas de accesibilidad. Por eso existe la tarjeta de **revisión manual**.

---

© Marina Ziembar
