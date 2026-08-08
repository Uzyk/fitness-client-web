import { useMemo, useState } from "react";
import { formatExerciseDisplay } from "../../coach/data/exercisePrescription.js";
import { buildRoutineFeedback } from "../../lib/sessionFeedback.js";
import { getFeedbackForExercise } from "../../lib/feedbackByExercise.js";

export default function StudentRoutinesBrowser({
  routines,
  activeRoutineId,
  todayRoutineId,
  comments = [],
}) {
  const [selectedId, setSelectedId] = useState(
    () => todayRoutineId || activeRoutineId || routines[0]?.id || "",
  );

  const selected = useMemo(
    () => routines.find((plan) => plan.id === selectedId) || routines[0],
    [routines, selectedId],
  );

  const feedbackByExercise = useMemo(
    () => (selected ? buildRoutineFeedback(comments, selected) : new Map()),
    [comments, selected],
  );

  if (!routines.length) return null;

  return (
    <section className="coach-section coach-animate-in">
      <p className="coach-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
        Ejercicios y comentarios históricos de cada plan
      </p>

      {routines.length > 1 && (
        <select
          className="coach-field"
          value={selected?.id || ""}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="Seleccionar rutina"
        >
          {routines.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
              {plan.id === activeRoutineId ? " · activa" : ""}
              {plan.id === todayRoutineId ? " · hoy" : ""}
            </option>
          ))}
        </select>
      )}

      {selected && (
        <>
          <div className="coach-routine-title-row" style={{ marginTop: routines.length > 1 ? 12 : 0 }}>
            <h3 className="coach-routine-title">{selected.name}</h3>
            <div className="coach-routine-badges">
              {selected.id === activeRoutineId && (
                <span className="coach-routine-badge">Activa</span>
              )}
              {selected.id === todayRoutineId && (
                <span className="coach-routine-badge coach-routine-badge--today">Hoy</span>
              )}
            </div>
          </div>

          {selected.exercises.length === 0 ? (
            <p className="coach-empty">Esta rutina no tiene ejercicios.</p>
          ) : (
            <div className="coach-group coach-glass">
              {selected.exercises.map((item) => {
                const history = getFeedbackForExercise(feedbackByExercise, item.name);
                return (
                  <div key={item.id} className="coach-row coach-row--stacked">
                    <div className="coach-row-content">
                      <div className="coach-row-title">{item.name}</div>
                      <div className="coach-row-subtitle">{formatExerciseDisplay(item)}</div>
                      {history.length > 0 ? (
                        <div className="coach-exercise-comment-history" style={{ marginTop: 10 }}>
                          {history.slice(0, 5).map((fb) => (
                            <div key={fb.id} className="coach-exercise-comment-item">
                              <p className="coach-feedback-date coach-feedback-date--online">
                                Coach · {fb.date}
                              </p>
                              <p className="coach-feedback-text">{fb.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="coach-field-hint" style={{ marginTop: 8 }}>
                          Sin comentarios del coach para este ejercicio.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="coach-field-hint" style={{ marginTop: 10 }}>
            {selected.exercises.length} ejercicio{selected.exercises.length === 1 ? "" : "s"}
          </p>
        </>
      )}
    </section>
  );
}
