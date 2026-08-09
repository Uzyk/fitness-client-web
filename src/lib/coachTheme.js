/** Paleta por defecto (Vania Gaete) */
export const DEFAULT_COACH_THEME = {
  rosado: "#E879A9",
  rosadoPastel: "#FCE7F3",
  moradoPastel: "#DDD6FE",
  morado: "#A78BFA",
  celestePastel: "#BAE6FD",
  celeste: "#38BDF8",
};

export const THEME_PRESETS = [
  { id: "vania", label: "Vania — pasteles", theme: DEFAULT_COACH_THEME },
  {
    id: "fitness",
    label: "Fitness oscuro",
    theme: {
      rosado: "#FF6482",
      rosadoPastel: "rgba(255, 100, 130, 0.15)",
      moradoPastel: "rgba(191, 90, 242, 0.15)",
      morado: "#BF5AF2",
      celestePastel: "rgba(100, 210, 255, 0.12)",
      celeste: "#64D2FF",
    },
  },
  {
    id: "ocean",
    label: "Océano",
    theme: {
      rosado: "#06B6D4",
      rosadoPastel: "#CFFAFE",
      moradoPastel: "#E0F2FE",
      morado: "#0284C7",
      celestePastel: "#BAE6FD",
      celeste: "#0EA5E9",
    },
  },
];

export function applyCoachTheme(theme, root = document.documentElement) {
  const t = { ...DEFAULT_COACH_THEME, ...theme };
  root.style.setProperty("--v-rosado", t.rosado);
  root.style.setProperty("--v-rosado-pastel", t.rosadoPastel);
  root.style.setProperty("--v-morado-pastel", t.moradoPastel);
  root.style.setProperty("--v-morado", t.morado);
  root.style.setProperty("--v-celeste-pastel", t.celestePastel);
  root.style.setProperty("--v-celeste", t.celeste);
  root.style.setProperty("--ring-paid", t.celeste);
  root.style.setProperty("--ring-pending", t.rosado);
}

export function buildInviteUrl(token) {
  const appOrigin =
    import.meta.env.VITE_APP_ORIGIN ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://app.fitness-client-web.vercel.app";
  return `${appOrigin.replace(/\/$/, "")}/invite?token=${token}`;
}
