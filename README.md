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

## Personalizar para el cliente

Edita `src/config/site.js`:

- Nombre, tagline, descripción
- Email, teléfono, WhatsApp, dirección
- Redes sociales
- Servicios, planes y estadísticas

## Estructura

```
src/
├── config/site.js      # Datos de marca (editar aquí primero)
├── components/         # Secciones de la landing
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── Services.jsx
│   ├── Plans.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   └── Footer.jsx
└── index.css           # Design tokens globales
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
