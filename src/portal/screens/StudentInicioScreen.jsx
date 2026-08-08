import ScreenHeader from "../../coach/components/ScreenHeader.jsx";
import { formatCLP } from "../../coach/data/studentData.js";
import { formatExerciseDisplay } from "../../coach/data/exercisePrescription.js";
import { modalityLabel, paymentStatusLabel } from "../../coach/theme.js";

const VIDEO_STATUS = {
  pending: { text: "Video en revisión", class: "coach-badge--purple" },
  done: { text: "Feedback recibido", class: "coach-badge--green" },
  none: { text: "Sin video enviado", class: "coach-badge--gray" },
};

function formatPreviousSessionLabel(dateKey) {
  if (!dateKey) return "";
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function StudentInicioScreen({
  student,
  onLogout,
  isOnline,
  note,
  onNoteChange,
  submitting,
  onSubmitVideo,
}) {
  const sessionFeedback = student.sessionFeedbackByExercise || {};
  const routineTitle = student.routineName
    ? `Rutina de hoy: ${student.routineName}`
    : "Tu entrenamiento";
  const sessionModality =
    student.hasSessionToday && student.todaySessionKind
      ? student.todaySessionKind
      : student.modality;
  const sessionDetail =
    student.hasSessionToday &&
    student.todaySessionKind === "presencial" &&
    student.todaySessionTime
      ? ` · ${student.todaySessionTime}${student.todaySessionPlace ? ` · ${student.todaySessionPlace}` : ""}`
      : "";

  return (
    <div className="coach-screen">
      <ScreenHeader
        studioName={student.coach?.brand_name || "Studio Fit"}
        title={`Hola, ${student.name}`}
        subtitle={`${modalityLabel(sessionModality)}${sessionDetail} · ${paymentStatusLabel(student.paymentStatus)} · ${formatCLP(student.monthlyFee)}/mes`}
        onLogout={onLogout}
      />

      {!student.hasSessionToday && (
        <p className="coach-empty">
          No tienes sesión agendada hoy. Revisa el calendario o tus rutinas en la pestaña Rutina.
        </p>
      )}

      {student.hasSessionToday && student.routine.length > 0 && (
        <section className="coach-section coach-animate-in">
          <h2 className="coach-section-label">{routineTitle}</h2>
          {student.previousSessionDate ? (
            <p className="coach-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
              Feedback de la sesión anterior ({formatPreviousSessionLabel(student.previousSessionDate)})
            </p>
          ) : (
            <p className="coach-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
              Primera vez con esta rutina — aún no hay feedback de sesiones anteriores.
            </p>
          )}
          <div className="coach-group coach-glass">
            {student.routine.map((item) => {
              const st = VIDEO_STATUS[item.videoStatus] || VIDEO_STATUS.none;
              const coachFeedback = sessionFeedback[item.name];
              return (
                <div key={item.id} className="coach-row coach-row--stacked">
                  <div className="coach-row-content">
                    <div className="coach-row-title">{item.name}</div>
                    <div className="coach-row-subtitle">{formatExerciseDisplay(item)}</div>
                    {coachFeedback && (
                      <div className="coach-exercise-feedback">
                        <p
                          className={`coach-feedback-date ${
                            isOnline ? "coach-feedback-date--online" : "coach-feedback-date--presencial"
                          }`}
                        >
                          Coach · {coachFeedback.date}
                        </p>
                        <p className="coach-feedback-text">{coachFeedback.text}</p>
                      </div>
                    )}
                    {isOnline && item.videoStatus && (
                      <span className={`coach-badge ${st.class}`} style={{ marginTop: 6 }}>
                        {st.text}
                      </span>
                    )}
                  </div>
                  {isOnline && item.videoStatus !== "pending" && item.videoStatus !== "done" && (
                    <button
                      type="button"
                      className="coach-btn-primary coach-btn-sm"
                      disabled={submitting === item.name}
                      onClick={() => onSubmitVideo(item.name)}
                    >
                      {submitting === item.name ? "Enviando…" : "Enviar video"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {isOnline && (
            <textarea
              className="coach-feedback-input"
              placeholder="Nota opcional para tu coach (ej: me costó la profundidad)"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
              style={{ marginTop: 12 }}
            />
          )}
        </section>
      )}

      {student.hasSessionToday && student.routine.length === 0 && (
        <p className="coach-empty">
          Tienes sesión hoy, pero tu coach aún no asignó ejercicios para esta rutina.
        </p>
      )}

      {student.pendingVideos.length > 0 && (
        <section className="coach-section coach-animate-in" style={{ animationDelay: "120ms" }}>
          <h2 className="coach-section-label">Videos en revisión</h2>
          <p className="coach-subtitle" style={{ marginBottom: 12 }}>
            {student.pendingVideos.length} video{student.pendingVideos.length > 1 ? "s" : ""} enviado
            {student.pendingVideos.length > 1 ? "s" : ""} —{" "}
            {student.coach?.brand_name?.split(" ")[0] || "tu coach"} los revisará pronto.
          </p>
          <div className="coach-group coach-glass">
            {student.pendingVideos.map((video) => (
              <div key={video.id} className="coach-row">
                <div className="coach-row-content">
                  <div className="coach-row-title">{video.exercise}</div>
                  <div className="coach-row-subtitle">{video.sentAt}</div>
                </div>
                <span className="coach-badge coach-badge--purple">En revisión</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
