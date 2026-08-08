import { useState } from "react";
import { useAuth } from "../portal/context/AuthContext.jsx";
import { CoachProvider, useCoach } from "./context/CoachContext.jsx";
import TabBar from "./components/TabBar.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import CalendarScreen from "./screens/CalendarScreen.jsx";
import StudentsScreen from "./screens/StudentsScreen.jsx";
import PaymentsScreen from "./screens/PaymentsScreen.jsx";
import StudentDetailScreen from "./screens/StudentDetailScreen.jsx";
import { getMonthLabel, getStudent } from "./data/studentData.js";
import { useTheme } from "./hooks/useTheme.jsx";
import CoachActionToast from "./components/CoachActionToast.jsx";

function CoachShell() {
  const { logout } = useAuth();
  const { ready, coach, students } = useCoach();
  const [tab, setTab] = useState("home");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [focusKind, setFocusKind] = useState(null);

  const openStudent = (id, kind = null) => {
    setSelectedStudentId(id);
    setFocusKind(kind);
  };

  const closeStudent = () => {
    setSelectedStudentId(null);
    setFocusKind(null);
  };

  if (!ready) {
    return (
      <div className="coach-screen">
        <p className="coach-subtitle">Cargando…</p>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="coach-screen">
        <h1 className="coach-large-title">Cuenta pendiente</h1>
        <p className="coach-subtitle">
          Tu cuenta aún no está vinculada a un perfil de coach. Usa el link de invitación que te
          enviamos por email.
        </p>
        <button type="button" className="coach-btn-secondary" onClick={logout} style={{ marginTop: 16 }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  const displayCoach = {
    name: coach.brand_name?.split(" ")[0] || "Coach",
    brand: coach.brand_name || "Studio Fit",
    monthLabel: getMonthLabel(),
  };

  const student = selectedStudentId ? getStudent(students, selectedStudentId) : null;

  if (student) {
    return (
      <main className="coach-main">
        <StudentDetailScreen student={student} focusKind={focusKind} onBack={closeStudent} />
      </main>
    );
  }

  return (
    <>
      <main className="coach-main">
        {tab === "home" && (
          <HomeScreen coach={displayCoach} onOpenStudent={openStudent} onLogout={logout} />
        )}
        {tab === "calendar" && <CalendarScreen onOpenStudent={openStudent} />}
        {tab === "students" && <StudentsScreen onOpenStudent={openStudent} />}
        {tab === "payments" && <PaymentsScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}

export default function CoachDashboard() {
  const { theme } = useTheme();

  return (
    <CoachProvider>
      <div className="coach-app" data-theme={theme}>
        <CoachActionToast />
        <CoachShell />
      </div>
    </CoachProvider>
  );
}
