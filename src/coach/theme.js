/** Vania Gaete — identidad visual panel coach (iOS + pasteles) */

export const brand = {
  name: "Vania Gaete",
};

/** Paleta elegida por Vania */
export const palette = {
  rosado: "#E879A9",
  rosadoPastel: "#FCE7F3",
  moradoPastel: "#DDD6FE",
  morado: "#A78BFA",
  celestePastel: "#BAE6FD",
  celeste: "#38BDF8",
};

export const colors = {
  bg: "#F2F2F7",
  bgElevated: "#FFFFFF",
  bgGrouped: "#FFFFFF",
  separator: "rgba(60, 60, 67, 0.12)",
  label: "#1C1C1E",
  labelSecondary: "rgba(60, 60, 67, 0.6)",
  labelTertiary: "rgba(60, 60, 67, 0.3)",
  accent: palette.rosado,
  accentSecondary: palette.morado,
  accentSky: palette.celeste,
  accentMuted: palette.rosadoPastel,
  green: "#34C759",
  greenMuted: "#D1FAE5",
  orange: "#E879A9",
  orangeMuted: palette.rosadoPastel,
  red: "#E11D48",
  redMuted: "#FFE4E6",
  purpleMuted: palette.moradoPastel,
  skyMuted: palette.celestePastel,
  fill: "rgba(120, 120, 128, 0.16)",
  tabBar: "rgba(255, 255, 255, 0.88)",
};

export const gradients = {
  primary: `linear-gradient(135deg, ${palette.rosado} 0%, ${palette.morado} 100%)`,
  header: `linear-gradient(180deg, ${palette.rosadoPastel} 0%, ${palette.celestePastel} 45%, ${colors.bg} 100%)`,
  video: `linear-gradient(135deg, ${palette.moradoPastel} 0%, ${palette.celestePastel} 100%)`,
};

export const fonts = {
  system:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
  rounded:
    '-apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", sans-serif',
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export function paymentStatusLabel(status) {
  const map = {
    paid: "Al día",
    pending: "Pendiente",
    overdue: "Atrasado",
    review: "Por revisar",
  };
  return map[status] || status;
}

export function modalityLabel(modality) {
  const map = {
    presencial: "Presencial",
    online: "Online",
    mixto: "Mixto",
  };
  return map[modality] || modality;
}

/** Descripción corta de la modalidad para UI */
export function modalityDescription(modality) {
  const map = {
    presencial: "Sesiones en gimnasio",
    online: "Corrección por video post entrenamiento",
    mixto: "Presencial + videos online",
  };
  return map[modality] || "";
}
