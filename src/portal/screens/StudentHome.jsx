import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../../coach/hooks/useTheme.jsx";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";
import { fetchStudentProfile, submitPaymentReceipt, submitPracticeVideo } from "../../lib/studentApi.js";
import StudentTabBar from "../components/StudentTabBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import StudentInicioScreen from "./StudentInicioScreen.jsx";
import StudentCalendarScreen from "./StudentCalendarScreen.jsx";
import StudentRoutineScreen from "./StudentRoutineScreen.jsx";
import StudentPaymentsScreen from "./StudentPaymentsScreen.jsx";

function StudentShell({ children, theme, tabBar }) {
  return (
    <div className="coach-app" data-theme={theme}>
      {children}
      {tabBar}
    </div>
  );
}

export default function StudentHome() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [tab, setTab] = useState("home");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [note, setNote] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const loadProfile = useCallback(async () => {
    const data = await fetchStudentProfile();
    setStudent(data);
    if (data?.coach?.theme) applyCoachTheme(data.coach.theme);
    else applyCoachTheme(DEFAULT_COACH_THEME);
  }, []);

  useEffect(() => {
    loadProfile().finally(() => setLoading(false));
  }, [loadProfile]);

  const showAction = (text, isError = false) => {
    setActionMessage({ text, isError });
    window.setTimeout(() => setActionMessage(null), 3500);
  };

  const handleSubmitVideo = async (exercise) => {
    setSubmitting(exercise);
    try {
      await submitPracticeVideo(exercise, exercise, note.trim());
      setNote("");
      await loadProfile();
      showAction("Video enviado — tu coach lo revisará pronto");
    } catch (err) {
      showAction(err.message || "No se pudo enviar el video", true);
    } finally {
      setSubmitting(null);
    }
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      await submitPaymentReceipt(file);
      await loadProfile();
      showAction("Comprobante enviado — tu coach lo revisará pronto");
    } catch (err) {
      showAction(err.message || "No se pudo subir el comprobante", true);
    } finally {
      setUploadingReceipt(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <StudentShell theme={theme}>
        <main className="coach-main coach-main--student">
          <div className="coach-screen">
            <p className="coach-subtitle">Cargando…</p>
          </div>
        </main>
      </StudentShell>
    );
  }

  if (!student) {
    return (
      <StudentShell theme={theme}>
        <main className="coach-main coach-main--student">
          <div className="coach-screen">
            <h1 className="coach-large-title">Sin plan asignado</h1>
            <p className="coach-subtitle">
              Tu cuenta aún no está vinculada a un coach. Contacta a tu entrenador para activar tu
              acceso.
            </p>
            <button type="button" className="coach-btn-primary" onClick={logout} style={{ marginTop: 16 }}>
              Cerrar sesión
            </button>
          </div>
        </main>
      </StudentShell>
    );
  }

  const isOnline =
    student.hasSessionToday && student.todaySessionKind
      ? student.todaySessionKind === "online"
      : student.modality === "online";
  const needsReceipt =
    student.paymentStatus === "pending" || student.paymentStatus === "overdue";

  return (
    <StudentShell theme={theme} tabBar={<StudentTabBar active={tab} onChange={setTab} />}>
      {actionMessage && (
        <div
          className={`coach-action-toast${actionMessage.isError ? " coach-action-toast--error" : ""}`}
          role="status"
        >
          {actionMessage.text}
        </div>
      )}

      <main className="coach-main coach-main--student coach-main--tabbed">
        {tab === "home" && (
          <StudentInicioScreen
            student={student}
            onLogout={logout}
            isOnline={isOnline}
            note={note}
            onNoteChange={setNote}
            submitting={submitting}
            onSubmitVideo={handleSubmitVideo}
          />
        )}
        {tab === "calendar" && (
          <StudentCalendarScreen student={student} onLogout={logout} />
        )}
        {tab === "routine" && (
          <StudentRoutineScreen student={student} onLogout={logout} />
        )}
        {tab === "payments" && (
          <StudentPaymentsScreen
            student={student}
            onLogout={logout}
            needsReceipt={needsReceipt}
            uploadingReceipt={uploadingReceipt}
            onReceiptUpload={handleReceiptUpload}
          />
        )}
      </main>
    </StudentShell>
  );
}
