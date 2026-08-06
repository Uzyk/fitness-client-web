import AdminDashboard from "../admin/AdminDashboard.jsx";
import CoachDashboard from "../coach/CoachDashboard.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import PortalLogin from "./screens/PortalLogin.jsx";
import StudentHome from "./screens/StudentHome.jsx";

function PortalRouter() {
  const { ready, session, role } = useAuth();

  if (!ready) {
    return (
      <div className="portal-app">
        <p className="portal-loading">Cargando…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="portal-app">
        <PortalLogin />
      </div>
    );
  }

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "coach") {
    return <CoachDashboard />;
  }

  if (role === "student") {
    return (
      <div className="portal-app">
        <StudentHome />
      </div>
    );
  }

  return (
    <div className="portal-app portal-unknown">
      <h1 className="portal-title">Cuenta sin acceso</h1>
      <p className="portal-subtitle">
        Tu perfil no tiene un rol asignado. Contacta al administrador.
      </p>
      <LogoutButton />
    </div>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button type="button" className="portal-btn-primary" onClick={logout}>
      Cerrar sesión
    </button>
  );
}

export default function PortalApp() {
  return (
    <AuthProvider>
      <PortalRouter />
    </AuthProvider>
  );
}
