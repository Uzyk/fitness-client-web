import { useState } from "react";
import { useTheme } from "./hooks/useTheme.jsx";
import { CoachProvider, useCoach } from "./context/CoachContext.jsx";
import TabBar from "./components/TabBar.jsx";
import CoachLogin from "./screens/CoachLogin.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import CalendarScreen from "./screens/CalendarScreen.jsx";
import StudentsScreen from "./screens/StudentsScreen.jsx";
import PaymentsScreen from "./screens/PaymentsScreen.jsx";
import StudentDetailScreen from "./screens/StudentDetailScreen.jsx";
import { getStudent, coach as mockCoach } from "./data/mock.js";

function CoachShell() {
  const { ready, session, coach } = useCoach();
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

  if (!session) {
    return <CoachLogin />;
  }

  if (!coach) {
    return (
      <div className="coach-screen">
        <h1 className="coach-large-title">Cuenta pendiente</h1>
        <p className="coach-subtitle">
          Tu cuenta aún no está vinculada a un perfil de coach. Usa el link de invitación que te
          enviamos por email.
        </p>
      </div>
    );
  }

  const displayCoach = {
    name: coach.brand_name?.split(" ")[0] || mockCoach.name,
    brand: coach.brand_name || mockCoach.brand,
    monthLabel: mockCoach.monthLabel,
  };

  const student = selectedStudentId ? getStudent(selectedStudentId) : null;

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
        {tab === "home" && <HomeScreen coach={displayCoach} onOpenStudent={openStudent} />}
        {tab === "calendar" && <CalendarScreen onOpenStudent={openStudent} />}
        {tab === "students" && <StudentsScreen onOpenStudent={openStudent} />}
        {tab === "payments" && <PaymentsScreen onOpenStudent={openStudent} />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </>
  );
}

export default function CoachApp() {
  const { theme } = useTheme();

  return (
    <CoachProvider>
      <div className="coach-app" data-theme={theme}>
        <CoachShell />
      </div>
    </CoachProvider>
  );
}
