export default function AdminSidebar({ view, onNavigate, onLogout }) {
  return (
    <aside className="admin-sidebar" aria-label="Navegación admin">
      <div className="admin-sidebar-brand">
        <p className="admin-eyebrow">Studio Fit</p>
        <p className="admin-sidebar-title">Administración</p>
      </div>
      <nav className="admin-sidebar-nav">
        <button
          type="button"
          className={`admin-sidebar-link${view === "list" || view === "form" || view === "students" ? " admin-sidebar-link--active" : ""}`}
          onClick={() => onNavigate("list")}
        >
          Coaches
        </button>
      </nav>
      <button type="button" className="admin-sidebar-logout" onClick={onLogout}>
        Salir
      </button>
    </aside>
  );
}
