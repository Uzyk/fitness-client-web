import { useMemo, useState } from "react";
import MonthCalendar from "../components/MonthCalendar.jsx";
import ScreenHeader from "../components/ScreenHeader.jsx";
import { useCoach } from "../context/CoachContext.jsx";
import {
  formatAgendaSubtitle,
  getAgendaByDate,
  getOnlineTrainingDatesSet,
  getSessionDatesSet,
  getStudent,
  getUpcomingAgenda,
} from "../data/studentData.js";
import { getRoutineNameForSchedule } from "../data/routinePlans.js";
import { formatDayLong, parseDateKey, toDateKey } from "../utils/calendar.js";
import { modalityLabel } from "../theme.js";

const TODAY = new Date();

function RoutineBadge({ name, linked = true }) {
  return (
    <span
      className={`coach-routine-badge${linked ? "" : " coach-routine-badge--muted"}`}
      title={name}
    >
      {name}
    </span>
  );
}

function SessionMeta({ item }) {
  const parts = [];
  if (item.kind === "presencial" && item.time) parts.push(item.time);
  parts.push(modalityLabel(item.kind === "presencial" ? "presencial" : "online"));
  return <span className="coach-row-subtitle">{parts.join(" · ")}</span>;
}

function AgendaRow({ item, students, onOpenStudent }) {
  const student = getStudent(students, item.studentId);
  if (!student) return null;

  const isOnline = item.kind === "online";
  const routineName = getRoutineNameForSchedule(student, item);
  const hasLinkedRoutine = Boolean(item.routineId && routineName);

  return (
    <button
      type="button"
      className="coach-row coach-row--session"
      onClick={() => onOpenStudent(item.studentId, isOnline ? "videos" : undefined)}
    >
      {isOnline ? (
        <span className="coach-day-dot coach-day-dot--online" aria-hidden />
      ) : (
        <span className="coach-day-dot coach-day-dot--presencial" aria-hidden />
      )}
      <div className="coach-row-content">
        <div className="coach-row-title">{student.name}</div>
        <div className="coach-session-meta">
          <RoutineBadge
            name={routineName || item.focus || "Sin rutina"}
            linked={hasLinkedRoutine}
          />
          <SessionMeta item={item} />
        </div>
      </div>
      <span className="coach-chevron">›</span>
    </button>
  );
}

function formatUpcomingDate(dateKey) {
  const todayKey = toDateKey(TODAY);
  if (dateKey === todayKey) return "Hoy";
  const tomorrow = new Date(TODAY);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === toDateKey(tomorrow)) return "Mañana";
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
}

export default function CalendarScreen({ onOpenStudent }) {
  const { students, schedule, scheduleSession } = useCoach();
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(TODAY));
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [kind, setKind] = useState("presencial");
  const [date, setDate] = useState(selectedDateKey);
  const [time, setTime] = useState("09:00");
  const [place, setPlace] = useState("Gimnasio");
  const [focus, setFocus] = useState("Entrenamiento");
  const [routineId, setRoutineId] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedStudent = getStudent(students, studentId);
  const studentRoutines = selectedStudent?.routines || [];

  const presencialDates = useMemo(() => getSessionDatesSet(schedule), [schedule]);
  const onlineDates = useMemo(() => getOnlineTrainingDatesSet(schedule), [schedule]);
  const upcoming = useMemo(
    () => getUpcomingAgenda(schedule, toDateKey(TODAY), 5),
    [schedule],
  );
  const dayAgenda = useMemo(
    () => getAgendaByDate(schedule, selectedDateKey),
    [schedule, selectedDateKey],
  );

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    const d = parseDateKey(dateKey);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!studentId || !date) return;
    setSaving(true);
    try {
      await scheduleSession(studentId, {
        date,
        kind,
        time: kind === "presencial" ? time : null,
        place: kind === "presencial" ? place : null,
        focus: kind === "online" && !routineId ? focus : null,
        routineId: routineId || null,
      });
      setShowForm(false);
      selectDate(date);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coach-screen">
      <ScreenHeader title="Calendario" subtitle="Sesiones y entrenamientos" />

      <section className="coach-section coach-animate-in">
        <h2 className="coach-section-label">Próximas sesiones</h2>
        <div className="coach-group coach-glass">
          {upcoming.length === 0 ? (
            <div className="coach-row">
              <span className="coach-row-subtitle">No hay sesiones próximas</span>
            </div>
          ) : (
            upcoming.map((item) => {
              const student = getStudent(students, item.studentId);
              const sessionSubtitle = formatAgendaSubtitle(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="coach-row"
                  onClick={() => selectDate(item.date)}
                >
                  <div className="coach-row-content">
                    <div className="coach-row-title">{student?.name}</div>
                    <div className="coach-row-subtitle">
                      {formatUpcomingDate(item.date)}
                      {sessionSubtitle ? ` · ${sessionSubtitle}` : ""}
                    </div>
                  </div>
                  <span className="coach-chevron">›</span>
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className="coach-section">
        <h2 className="coach-section-label">Mes completo</h2>
        <p className="coach-calendar-hint">
          <span className="coach-legend-dot coach-legend-dot--presencial" /> Presencial
          <span className="coach-legend-dot coach-legend-dot--online" /> Online
        </p>
        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          selectedDateKey={selectedDateKey}
          presencialDates={presencialDates}
          onlineDates={onlineDates}
          onSelectDay={setSelectedDateKey}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
        />
      </section>

      <section className="coach-section">
        <h2 className="coach-section-label">{formatDayLong(selectedDateKey)}</h2>
        <div className="coach-group coach-glass">
          {dayAgenda.length === 0 ? (
            <div className="coach-row">
              <span className="coach-row-subtitle coach-row-subtitle--muted">
                Sin sesiones este día
              </span>
            </div>
          ) : (
            dayAgenda.map((item) => (
              <AgendaRow
                key={item.id}
                item={item}
                students={students}
                onOpenStudent={onOpenStudent}
              />
            ))
          )}
        </div>
      </section>

      {showForm ? (
        <form className="coach-inline-form coach-glass" onSubmit={handleSchedule} style={{ marginTop: 8 }}>
          <h3 className="coach-section-label">Agendar sesión</h3>
          <select value={studentId} onChange={(e) => {
            setStudentId(e.target.value);
            setRoutineId("");
          }} required>
            <option value="">Seleccionar alumno</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {studentRoutines.length > 0 && (
            <select
              value={routineId}
              onChange={(e) => setRoutineId(e.target.value)}
              aria-label="Rutina del día"
            >
              <option value="">Sin rutina específica</option>
              {studentRoutines.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          )}
          {studentRoutines.length === 0 && studentId && (
            <p className="coach-routine-hint">
              Crea rutinas nombradas en la ficha del alumno (pestaña Rutina) para asignarlas aquí.
            </p>
          )}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
          </select>
          {kind === "presencial" ? (
            <>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <input
                type="text"
                placeholder="Lugar"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </>
          ) : (
            !routineId && (
              <input
                type="text"
                placeholder="Enfoque del entrenamiento (si no eliges rutina)"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              />
            )
          )}
          <div className="coach-inline-actions">
            <button type="submit" className="coach-btn-primary" disabled={saving}>
              {saving ? "Agendando…" : "Confirmar"}
            </button>
            <button type="button" className="coach-btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="coach-btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => {
            setDate(selectedDateKey);
            const first = students[0];
            setStudentId(first?.id || "");
            setRoutineId("");
            setShowForm(true);
          }}
        >
          + Agendar sesión
        </button>
      )}
    </div>
  );
}
