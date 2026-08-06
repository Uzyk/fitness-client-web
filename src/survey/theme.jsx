/** Studio Fit — identidad visual encuestas (morado + negro, premium) */
export const COLORS = {
  bg: "#050508",
  bgElevated: "#0C0C12",
  accent: "#A855F7",
  accentLight: "#C084FC",
  accentDark: "#7C3AED",
  accentDeep: "#6D28D9",
  accentText: "#FFFFFF",
  accentMuted: "rgba(168, 85, 247, 0.12)",
  accentBorder: "rgba(168, 85, 247, 0.28)",
  accentGlow: "rgba(147, 51, 234, 0.4)",
  text: "#E4E4E7",
  textBright: "#FAFAFA",
  muted: "#A1A1AA",
  dim: "#71717A",
  faint: "#3F3F46",
  error: "#F87171",
  success: "#34D399",
  card: "rgba(12, 12, 18, 0.85)",
  cardInput: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.06)",
  borderStrong: "rgba(255, 255, 255, 0.1)",
  borderInput: "rgba(168, 85, 247, 0.2)",
};

export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 50%, ${COLORS.accentDeep} 100%)`,
  progress: `linear-gradient(90deg, ${COLORS.accentLight}, ${COLORS.accent}, ${COLORS.accentDark})`,
  bg: `
    radial-gradient(ellipse 90% 70% at 50% -20%, rgba(147, 51, 234, 0.22), transparent 55%),
    radial-gradient(ellipse 60% 50% at 100% 50%, rgba(109, 40, 217, 0.12), transparent 50%),
    radial-gradient(ellipse 50% 40% at 0% 80%, rgba(88, 28, 135, 0.1), transparent 45%),
    ${COLORS.bg}
  `,
  cardBorder: `linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(255,255,255,0.06) 40%, rgba(124, 58, 237, 0.2))`,
  buttonHover: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.accent})`,
};

export const SHADOWS = {
  card: "0 0 0 1px rgba(168, 85, 247, 0.08), 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 80px rgba(147, 51, 234, 0.06)",
  button: "0 4px 24px rgba(147, 51, 234, 0.35)",
  glow: "0 0 20px rgba(168, 85, 247, 0.25)",
};

export const FONTS = {
  display: "'Syne', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'DM Mono', monospace",
};

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${COLORS.bg}; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 3px; }
    `}</style>
  );
}

export function PremiumCard({ children, style = {} }) {
  return (
    <div style={{ position: "relative", borderRadius: "20px", padding: "1px", background: GRADIENTS.cardBorder, ...style }}>
      <div
        style={{
          background: COLORS.card,
          borderRadius: "19px",
          padding: "32px",
          backdropFilter: "blur(20px)",
          boxShadow: SHADOWS.card,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, fullWidth = true, as = "button", href, style = {} }) {
  const base = {
    width: fullWidth ? "100%" : undefined,
    background: disabled ? "rgba(255,255,255,0.04)" : GRADIENTS.primary,
    border: disabled ? `1px solid ${COLORS.border}` : "none",
    borderRadius: "12px",
    padding: "14px 22px",
    color: disabled ? COLORS.dim : COLORS.accentText,
    fontFamily: FONTS.body,
    fontSize: "15px",
    fontWeight: "600",
    cursor: disabled ? "default" : "pointer",
    transition: "all 0.2s ease",
    boxShadow: disabled ? "none" : SHADOWS.button,
    textDecoration: "none",
    display: fullWidth ? "block" : "inline-block",
    textAlign: "center",
    letterSpacing: "0.02em",
    ...style,
  };

  if (as === "a" && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={base}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  );
}
