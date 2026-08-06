import { useTheme } from "../hooks/useTheme.jsx";

export default function ScreenHeader({ eyebrow, title, subtitle, showThemeToggle = true }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="coach-screen-header">
      <div className="coach-screen-header-text">
        {eyebrow && <p className="coach-eyebrow">{eyebrow}</p>}
        <h1 className="coach-large-title">{title}</h1>
        {subtitle && <p className="coach-subtitle">{subtitle}</p>}
      </div>
      {showThemeToggle && (
        <button
          type="button"
          className="coach-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      )}
    </header>
  );
}
