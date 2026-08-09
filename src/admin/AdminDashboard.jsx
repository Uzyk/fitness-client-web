import { useState } from "react";
import { useAuth } from "../portal/context/AuthContext.jsx";
import AdminSidebar from "./components/AdminSidebar.jsx";
import CoachList from "./screens/CoachList.jsx";
import CoachForm from "./screens/CoachForm.jsx";
import CoachStudents from "./screens/CoachStudents.jsx";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [view, setView] = useState("list");
  const [editCoach, setEditCoach] = useState(null);
  const [studentsCoach, setStudentsCoach] = useState(null);

  const goList = () => {
    setEditCoach(null);
    setStudentsCoach(null);
    setView("list");
  };

  return (
    <div className="admin-app">
      <AdminSidebar view={view} onNavigate={goList} onLogout={logout} />

      <div className="admin-body">
        <header className="admin-header admin-header--mobile">
          <div>
            <p className="admin-eyebrow">Studio Fit</p>
            <h1 className="admin-title">Administración</h1>
          </div>
          <button type="button" className="admin-btn-ghost" onClick={logout}>
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
              onManageStudents={(coach) => {
                setStudentsCoach(coach);
                setView("students");
              }}
            />
          )}
          {view === "form" && (
            <CoachForm
              coach={editCoach}
              onBack={goList}
              onSaved={goList}
            />
          )}
          {view === "students" && studentsCoach && (
            <CoachStudents
              coach={studentsCoach}
              onBack={goList}
            />
          )}
        </main>
      </div>
    </div>
  );
}
