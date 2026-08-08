import ScreenHeader from "../components/ScreenHeader.jsx";
import ActivityRings, { RingLegend } from "../components/ActivityRings.jsx";
import { useCoach } from "../context/CoachContext.jsx";
import {
  formatAgendaSubtitle,
  getAttentionItems,
  getPaymentSummary,
  getStudent,
  getTodayAgenda,
} from "../data/studentData.js";

export default function HomeScreen({ coach, onOpenStudent, onLogout }) {
  const { students, schedule } = useCoach();
  const attention = getAttentionItems(students);
  const summary = getPaymentSummary(students);
  const todayAgenda = getTodayAgenda(schedule);

  return (
    <div className="coach-screen">
      <ScreenHeader
        studioName={coach.brand}
        eyebrow={coach.monthLabel}
        title={`Hola, ${coach.name}`}
        onLogout={onLogout}
      />

      <section className="coach-section coach-animate-in" style={{ animationDelay: "0ms" }}>
        <div className="coach-hero-card">
          <ActivityRings
            paid={summary.paid}
            pending={summary.pending}
            overdue={summary.overdue}
            total={summary.total}
          />
          <RingLegend paid={summary.paid} pending={summary.pending} overdue={summary.overdue} />
        </div>
      </section>

      <section className="coach-section coach-animate-in" style={{ animationDelay: "80ms" }}>
        <h2 className="coach-section-label">Hoy</h2>
        <div className="coach-group coach-glass">
          {todayAgenda.length === 0 ? (
            <div className="coach-row">
              <span className="coach-row-title coach-row-subtitle--muted">
                Sin sesiones programadas
              </span>
            </div>
          ) : (
            todayAgenda.map((item) => {
              const student = getStudent(students, item.studentId);
              const isOnline = item.kind === "online";

              return (
                <button
                  key={item.id}
                  type="button"
                  className="coach-row coach-row--interactive"
                  onClick={() => onOpenStudent(item.studentId, isOnline ? "videos" : undefined)}
                >
                  {isOnline ? (
                    <span className="coach-day-dot coach-day-dot--online" aria-hidden />
                  ) : (
                    <span className="coach-day-dot coach-day-dot--presencial" aria-hidden />
                  )}
                  <div className="coach-row-content">
                    <div className="coach-row-title">{student?.name}</div>
                    <div className="coach-row-subtitle">{formatAgendaSubtitle(item)}</div>
                  </div>
                  <span className="coach-chevron">›</span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {attention.length > 0 && (
        <section className="coach-section coach-animate-in" style={{ animationDelay: "160ms" }}>
          <h2 className="coach-section-label">Requiere tu atención</h2>
          <div className="coach-group coach-glass">
            {attention.map((item) => (
              <button
                key={item.id}
                type="button"
                className="coach-row coach-row--interactive"
                onClick={() => onOpenStudent(item.studentId, item.kind)}
              >
                <span className="coach-attention-dot" aria-hidden />
                <div className="coach-row-content">
                  <div className="coach-row-title">{item.studentName}</div>
                  <div className="coach-row-subtitle">{item.label}</div>
                </div>
                <span className="coach-chevron">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="coach-section coach-animate-in" style={{ animationDelay: "240ms" }}>
        <h2 className="coach-section-label">Resumen</h2>
        <div className="coach-group coach-glass">
          <div className="coach-row">
            <div className="coach-row-content">
              <div className="coach-row-title">{summary.total} alumnos activos</div>
              <div className="coach-row-subtitle">{coach.brand}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
