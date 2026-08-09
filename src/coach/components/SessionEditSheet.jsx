import { useEffect, useState } from "react";
import { getStudent } from "../data/studentData.js";
import { getRoutineNameForSchedule } from "../data/routinePlans.js";
import { formatDayLong } from "../utils/calendar.js";
import { modalityLabel } from "../theme.js";
import { useCoach } from "../context/CoachContext.jsx";

export default function SessionEditSheet({ item, students, onClose, onOpenStudent }) {
  const { updateSession, cancelSession } = useCoach();
  const student = getStudent(students, item?.studentId);
  const studentRoutines = student?.routines || [];

  const [kind, setKind] = useState("presencial");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [place, setPlace] = useState("Gimnasio");
  const [focus, setFocus] = useState("Entrenamiento");
  const [routineId, setRoutineId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!item) return;
    setKind(item.kind === "online" ? "online" : "presencial");
    setDate(item.date);
    setTime(item.time || "09:00");
    setPlace(item.place || "Gimnasio");
    setFocus(item.focus || "Entrenamiento");
    setRoutineId(item.routineId || "");
  }, [item]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item || !student) return null;

  const routineName = getRoutineNameForSchedule(student, item);
  const busy = saving || deleting;

  const buildPatch = () => {
    const patch = {
      kind,
      schedule_date: date,
      routine_id: routineId || null,
    };

    if (kind === "presencial") {
      patch.schedule_time = time;
      patch.place = place;
      patch.focus = null;
    } else {
      patch.schedule_time = null;
      patch.place = null;
      patch.focus = routineId ? null : focus;
    }

    return patch;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await updateSession(item.id, buildPatch());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const label = `${modalityLabel(kind)} · ${formatDayLong(date)}`;
    if (!window.confirm(`¿Desagendar la sesión de ${student.name} (${label})?`)) return;
    setDeleting(true);
    try {
      await cancelSession(item.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="coach-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="coach-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coach-sheet-handle" aria-hidden />
        <header className="coach-sheet-header">
          <div>
            <h2 id="session-sheet-title" className="coach-sheet-title">
              {student.name}
            </h2>
            <p className="coach-sheet-subtitle">
              {routineName || item.focus || "Sesión agendada"} · {formatDayLong(item.date)}
            </p>
          </div>
        </header>

        <form className="coach-sheet-body coach-inline-form" onSubmit={handleSave}>
          <label className="coach-field-label">
            <span className="coach-row-subtitle">Modalidad</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)} disabled={busy}>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </label>

          <label className="coach-field-label">
            <span className="coach-row-subtitle">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          {studentRoutines.length > 0 && (
            <label className="coach-field-label">
              <span className="coach-row-subtitle">Rutina</span>
              <select
                value={routineId}
                onChange={(e) => setRoutineId(e.target.value)}
                disabled={busy}
                aria-label="Rutina del día"
              >
                <option value="">Sin rutina específica</option>
                {studentRoutines.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {kind === "presencial" ? (
            <>
              <label className="coach-field-label">
                <span className="coach-row-subtitle">Hora</span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  disabled={busy}
                />
              </label>
              <label className="coach-field-label">
                <span className="coach-row-subtitle">Lugar</span>
                <input
                  type="text"
                  placeholder="Lugar"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  disabled={busy}
                />
              </label>
            </>
          ) : (
            !routineId && (
              <label className="coach-field-label">
                <span className="coach-row-subtitle">Enfoque</span>
                <input
                  type="text"
                  placeholder="Enfoque del entrenamiento"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  disabled={busy}
                />
              </label>
            )
          )}

          <div className="coach-sheet-actions">
            <button type="submit" className="coach-btn-primary" disabled={busy}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              className="coach-btn-danger"
              disabled={busy}
              onClick={handleDelete}
            >
              {deleting ? "Desagendando…" : "Desagendar sesión"}
            </button>
            {onOpenStudent && (
              <button
                type="button"
                className="coach-btn-secondary"
                disabled={busy}
                onClick={() => {
                  onClose();
                  onOpenStudent(item.studentId, kind === "online" ? "videos" : undefined);
                }}
              >
                Ver ficha del alumno
              </button>
            )}
          </div>
        </form>

        <button type="button" className="coach-sheet-close" onClick={onClose} disabled={busy}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
