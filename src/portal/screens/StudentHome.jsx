import { useAuth } from "../context/AuthContext.jsx";

export default function StudentHome() {
  const { profile, logout } = useAuth();

  return (
    <div className="portal-student">
      <header className="portal-student-header">
        <div>
          <p className="portal-eyebrow">Studio Fit</p>
          <h1 className="portal-title">Hola, {profile?.full_name || "Alumno"}</h1>
        </div>
        <button type="button" className="portal-btn-ghost" onClick={logout}>
          Salir
        </button>
      </header>
      <main className="portal-student-main">
        <p className="portal-subtitle">
          Tu panel de alumno estará disponible pronto. Aquí verás rutinas, pagos y feedback de tu
          coach.
        </p>
      </main>
    </div>
  );
}
