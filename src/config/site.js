export const site = {
  name: "Studio Fit",
  tagline: "Entrena con proposito. Resultados reales.",
  description:
    "Entrenamiento personalizado, planes de nutricion y seguimiento profesional para alcanzar tus objetivos.",
  email: "hola@studiofit.cl",
  phone: "+56 9 1234 5678",
  whatsapp: "56912345678",
  address: "Av. Providencia 1234, Santiago",
  social: {
    instagram: "https://instagram.com/studiofit",
    tiktok: "https://tiktok.com/@studiofit",
  },
  cta: {
    primary: "Reserva tu evaluacion",
    secondary: "Ver planes",
  },
  /** URL del portal coach/alumno (prod: subdominio app; dev: /app local) */
  portalUrl:
    import.meta.env.VITE_PORTAL_URL ||
    (import.meta.env.DEV ? "/app" : "https://app.fitness-client-web.vercel.app/app"),
};

export const services = [
  {
    id: "personal",
    title: "Entrenamiento personal",
    description:
      "Sesiones 1:1 con coach certificado. Plan adaptado a tu nivel, objetivos y disponibilidad.",
    icon: "💪",
  },
  {
    id: "grupo",
    title: "Clases grupales",
    description:
      "HIIT, fuerza funcional y movilidad en grupos reducidos para mantener la motivacion.",
    icon: "🔥",
  },
  {
    id: "nutricion",
    title: "Asesoria nutricional",
    description:
      "Guias alimentarias alineadas con tu entrenamiento. Sin dietas extremas, enfoque sostenible.",
    icon: "🥗",
  },
  {
    id: "online",
    title: "Coaching online",
    description:
      "Rutinas y seguimiento remoto para quienes entrenan en casa o viajan con frecuencia.",
    icon: "📱",
  },
];

export const plans = [
  {
    id: "basico",
    name: "Basico",
    price: "29.990",
    period: "/mes",
    features: ["2 sesiones grupales/semana", "Acceso a app de seguimiento", "Evaluacion inicial"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "59.990",
    period: "/mes",
    features: [
      "4 sesiones personalizadas/semana",
      "Plan nutricional basico",
      "Seguimiento semanal con coach",
      "Acceso ilimitado a clases",
    ],
    highlighted: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "89.990",
    period: "/mes",
    features: [
      "Entrenamiento personal ilimitado",
      "Nutricion personalizada",
      "Analisis de composicion corporal",
      "Soporte WhatsApp prioritario",
    ],
    highlighted: false,
  },
];

export const stats = [
  { value: "500+", label: "Clientes activos" },
  { value: "8", label: "Anos de experiencia" },
  { value: "15", label: "Coaches certificados" },
  { value: "4.9", label: "Valoracion promedio" },
];