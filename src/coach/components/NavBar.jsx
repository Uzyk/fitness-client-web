import { useTheme } from "../hooks/useTheme.jsx";

export default function NavBar({ title, onBack }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="coach-navbar">
      <button type="button" className="coach-back" onClick={onBack}>
        ‹ Atrás
      </button>
      <h1 className="coach-navbar-title">{title}</h1>
      <button
        type="button"
        className="coach-theme-toggle coach-theme-toggle--compact"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </header>
  );
}
