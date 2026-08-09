import { useState } from "react";
import { useAuth } from "../portal/context/AuthContext.jsx";
import CoachList from "./screens/CoachList.jsx";
import CoachForm from "./screens/CoachForm.jsx";
import CoachStudents from "./screens/CoachStudents.jsx";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [view, setView] = useState("list");
  const [editCoach, setEditCoach] = useState(null);
  const [studentsCoach, setStudentsCoach] = useState(null);

  return (
    <div className="admin-app">
      <header className="admin-header">
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
            onBack={() => setView("list")}
            onSaved={() => setView("list")}
          />
        )}
        {view === "students" && studentsCoach && (
          <CoachStudents
            coach={studentsCoach}
            onBack={() => {
              setStudentsCoach(null);
              setView("list");
            }}
          />
        )}
      </main>
    </div>
  );
}
