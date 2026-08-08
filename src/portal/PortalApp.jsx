import AdminDashboard from "../admin/AdminDashboard.jsx";
import CoachDashboard from "../coach/CoachDashboard.jsx";
import { useTheme } from "../coach/hooks/useTheme.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import PortalLogin from "./screens/PortalLogin.jsx";
import StudentHome from "./screens/StudentHome.jsx";

function PortalLoading() {
  const { theme } = useTheme();
  return (
    <div className="coach-app" data-theme={theme}>
      <main className="coach-main coach-main--student">
        <div className="coach-screen">
          <p className="coach-subtitle">Cargando…</p>
        </div>
      </main>
    </div>
  );
}

function PortalRouter() {
  const { ready, session, role, logout } = useAuth();

  if (!ready) {
    return <PortalLoading />;
  }

  if (!session) {
    return <PortalLogin />;
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "coach") {
    return <CoachDashboard />;
  }

  if (role === "student") {
    return <StudentHome />;
  }

  return (
    <PortalUnknown onLogout={logout} />
  );
}

function PortalUnknown({ onLogout }) {
  const { theme } = useTheme();
  return (
    <div className="coach-app" data-theme={theme}>
      <main className="coach-main coach-main--student">
        <div className="coach-screen">
          <h1 className="coach-large-title">Cuenta sin acceso</h1>
          <p className="coach-subtitle">
            Tu perfil no tiene un rol asignado. Contacta al administrador.
          </p>
          <button type="button" className="coach-btn-primary" onClick={onLogout} style={{ marginTop: 16 }}>
            Cerrar sesión
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PortalApp() {
  return (
    <AuthProvider>
      <PortalRouter />
    </AuthProvider>
  );
}
