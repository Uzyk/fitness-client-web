# Plantilla de encuestas reutilizable

Base visual heredada de **AI Fitness Coach Survey** (`ai-fitness-coach-survey`):
- Fondo `#0D0D0D`, acento `#C8F135`
- Fuentes Syne / DM Sans / DM Mono
- Barra de progreso, cards, botones choice

## Arquitectura

```
src/survey/
├── SurveyApp.jsx       # Motor multi-paso
├── components.jsx      # UI (estética AI Fitness Coach)
├── theme.jsx           # Colores y fuentes
├── utils.js            # Validación y helpers
├── submit.js           # Supabase + WhatsApp
└── surveys/
    ├── index.js        # Registry por slug
    └── coach-discovery.js   # Encuesta actual
```

## Crear encuesta para un nuevo cliente

1. Copia `coach-discovery.js` → `surveys/mi-cliente.js`
2. Edita `slug`, `badge`, `title`, `intro`, `sections`
3. Regístrala en `surveys/index.js`:

```js
import { miClienteSurvey } from "./mi-cliente.js";

const registry = {
  "coach-discovery": coachDiscoverySurvey,
  "mi-cliente": miClienteSurvey,
};
```

4. Comparte: `https://tu-dominio.cl/encuesta?s=mi-cliente`

## Tipos de pregunta

| type | Uso |
|------|-----|
| `single` | Una opción |
| `multi` | Varias opciones |
| `rank` | Ordenar 1–N |
| `open` | Texto largo |
| `text` | Texto corto |
| `email` | Email con validación |
| `tel` | Teléfono |

## Supabase

Tabla `survey_responses` — ver `supabase/migrations/001_survey_responses.sql`

Campos clave: `survey_slug`, `nombre`, `email`, `respuestas` (jsonb), `raw` (jsonb)

## Variables de entorno (Vercel)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WHATSAPP_RECIPIENT=
```

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```

Configurar env vars en Vercel Dashboard → Settings → Environment Variables.

## URLs

| Ruta | Descripción |
|------|-------------|
| `/encuesta.html` | Default (`coach-discovery`) |
| `/encuesta?s=coach-discovery` | Con slug explícito |
| `/e/coach-discovery` | Rewrite corto (vercel.json) |
