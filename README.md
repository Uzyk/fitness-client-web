# Web Fitness — Cliente

Landing page profesional para un negocio fitness (gimnasio, estudio o coach personal).

## Stack

- **React 19** + **Vite 8**
- CSS Modules + design tokens
- Deploy recomendado: **Vercel** (igual que `ai-fitness-coach-survey`)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Formulario discovery (plantilla reutilizable)

Motor de encuestas con estética **AI Fitness Coach** + guardado en **Supabase** + envío por **WhatsApp**.

| URL | Uso |
|-----|-----|
| `/encuesta.html` | Encuesta coach-discovery (default) |
| `/encuesta?s=coach-discovery` | Con slug explícito |
| `/e/coach-discovery` | URL corta (Vercel rewrite) |

Documentación para nuevos clientes: **`docs/SURVEY-TEMPLATE.md`**

### Supabase

Proyecto: **Encuesta coach ai** (`soeyyyipgubxmyedgxng`)  
Tabla: `survey_responses` — migración en `supabase/migrations/001_survey_responses.sql`

### Variables de entorno

Copia `.env.example` → `.env` y configura también en Vercel:

```
VITE_SUPABASE_URL=https://soeyyyipgubxmyedgxng.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_WHATSAPP_RECIPIENT=569XXXXXXXX
```

### Deploy Vercel

```bash
npm run build
npx vercel --prod
```

### Compartir por WhatsApp

> Hola! Formulario corto (8–10 min) para entender tu coaching y validar la idea del desbloqueo con comprobante: [link]/encuesta

Al finalizar: respuestas guardadas en Supabase + botón **Enviar por WhatsApp**.

## Personalizar landing

Edita `src/config/site.js`:

- Nombre, tagline, descripción
- Email, teléfono, WhatsApp, dirección
- Redes sociales
- Servicios, planes y estadísticas

## Estructura

```
src/
├── survey/             # Motor de encuestas reutilizable
│   ├── SurveyApp.jsx
│   ├── components.jsx  # Estética AI Fitness Coach
│   └── surveys/        # Una encuesta por cliente/slug
├── config/site.js      # Landing — datos de marca
├── components/         # Secciones landing
└── lib/supabase.js
```

## Design system

Heredado del trabajo previo en fitness local:

| Token | Valor | Origen |
|-------|-------|--------|
| Fondo | `#0D0D0D` | ai-fitness-coach-survey |
| Acento | `#C8F135` | ai-fitness-coach-survey |
| Display | Syne | ai-fitness-coach-survey |
| Body | DM Sans | ai-fitness-coach-survey |
| Mono | DM Mono | ai-fitness-coach-survey |

## Deploy

```bash
npm run build
```

Output en `dist/`. Compatible con Vercel, Netlify o cualquier hosting estático.

## Próximos pasos sugeridos

- [ ] Definir datos reales del cliente en `site.js`
- [ ] Añadir fotos reales del gimnasio/coach
- [ ] Conectar formulario de contacto (Supabase, Formspree, Resend)
- [ ] SEO: meta tags, Open Graph, sitemap
- [ ] Analytics (Plausible, GA4)
- [ ] Dominio del cliente

## Proyectos relacionados (local)

| Proyecto | Ruta | Uso |
|----------|------|-----|
| Encuesta AI Fitness Coach | `~/Projects/ai-fitness-coach-survey` | Design system, Supabase, encuestas |
| Agente fitness | `~/Projects/cursor-agent-fitness` | Reglas coach, plantillas rutinas |
| Coach IA (app móvil) | `E:/AI/.../coach-ia` | Catálogo ejercicios, lógica entrenamiento |

Ver `docs/CONTEXTO.md` para más detalle.
