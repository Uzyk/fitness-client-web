import { useEffect, useState } from "react";
import { getProfile, isAdminUser, onAuthChange, signOut } from "../lib/auth.js";
import AdminLogin from "./screens/AdminLogin.jsx";
import CoachList from "./screens/CoachList.jsx";
import CoachForm from "./screens/CoachForm.jsx";

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("list");
  const [editCoach, setEditCoach] = useState(null);

  const checkAuth = async () => {
    const admin = await isAdminUser();
    setAuthed(Boolean(await getProfile()));
    setIsAdmin(admin);
    setReady(true);
  };

  useEffect(() => {
    checkAuth();
    return onAuthChange(() => checkAuth());
  }, []);

  const handleLogout = async () => {
    await signOut();
    setView("list");
    setEditCoach(null);
  };

  if (!ready) {
    return (
      <div className="admin-app">
        <p className="admin-muted">Cargando…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-app">
        <AdminLogin onSuccess={checkAuth} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-app">
        <div className="admin-auth">
          <h1 className="admin-title">Acceso denegado</h1>
          <p className="admin-subtitle">Esta cuenta no tiene rol de administrador.</p>
          <button type="button" className="admin-btn-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Studio Fit</p>
          <h1 className="admin-title">Administración</h1>
        </div>
        <button type="button" className="admin-btn-ghost" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="admin-main">
        {view === "list" && (
          <CoachList
            onAdd={() => {
              setEditCoach(null);
              setView("form");
            }}
            onEdit={(coach) => {
              setEditCoach(coach);
              setView("form");
            }}
          />
        )}
        {view === "form" && (
          <CoachForm
            coach={editCoach}
            onBack={() => setView("list")}
            onSaved={() => setView("list")}
          />
        )}
      </main>
    </div>
  );
}
