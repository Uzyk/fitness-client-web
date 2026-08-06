export const COLORS = {
  bg: "#0D0D0D",
  accent: "#C8F135",
  accentDark: "#96D900",
  accentText: "#0D0D0D",
  text: "#E8E8E8",
  textBright: "#F0F0F0",
  muted: "#888",
  dim: "#555",
  faint: "#3A3A3A",
  error: "#FF7A7A",
  success: "#7EC894",
  card: "rgba(255,255,255,0.03)",
  cardInput: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.12)",
  borderInput: "rgba(255,255,255,0.15)",
};

export const FONTS = {
  display: "'Syne', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${COLORS.bg}; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
    `}</style>
  );
}
