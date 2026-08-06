const TABS = [
  { id: "home", label: "Inicio", icon: "◉" },
  { id: "calendar", label: "Calendario", icon: "▦" },
  { id: "students", label: "Alumnos", icon: "◎" },
  { id: "payments", label: "Pagos", icon: "◈" },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="coach-tabbar" aria-label="Navegación principal">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`coach-tab${active === tab.id ? " coach-tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <span className="coach-tab-icon" aria-hidden>
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
