import { useMemo, useState } from "react";
import MonthCalendar from "../../coach/components/MonthCalendar.jsx";
import ScreenHeader from "../../coach/components/ScreenHeader.jsx";
import {
  getAgendaByDate,
  getOnlineTrainingDatesSet,
  getSessionDatesSet,
  getUpcomingAgenda,
} from "../../coach/data/studentData.js";
import { getRoutineNameForSchedule } from "../../coach/data/routinePlans.js";
import { formatDayLong, parseDateKey, toDateKey } from "../../coach/utils/calendar.js";
import { modalityLabel } from "../../coach/theme.js";

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

function SessionRow({ item, student }) {
  const isOnline = item.kind === "online";
  const routineName = getRoutineNameForSchedule(student, item);
  const hasLinkedRoutine = Boolean(item.routineId && routineName);
  const parts = [];
  if (item.kind === "presencial" && item.time) parts.push(item.time);
  if (item.kind === "presencial" && item.place) parts.push(item.place);
  parts.push(modalityLabel(isOnline ? "online" : "presencial"));

  return (
    <div className="coach-row coach-row--session">
      {isOnline ? (
        <span className="coach-day-dot coach-day-dot--online" aria-hidden />
      ) : (
        <span className="coach-day-dot coach-day-dot--presencial" aria-hidden />
      )}
      <div className="coach-row-content">
        <div className="coach-row-title">
          {isOnline ? "Entrenamiento online" : "Sesión presencial"}
        </div>
        <div className="coach-session-meta">
          <RoutineBadge
            name={routineName || item.focus || "Sin rutina asignada"}
            linked={hasLinkedRoutine}
          />
          <span className="coach-row-subtitle">{parts.join(" · ")}</span>
        </div>
      </div>
    </div>
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

export default function StudentCalendarScreen({ student, onLogout }) {
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(TODAY));

  const schedule = student.schedule || [];

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

  return (
    <div className="coach-screen coach-screen--calendar">
      <ScreenHeader
        studioName={student.coach?.brand_name || "Studio Fit"}
        title="Calendario"
        subtitle="Tus sesiones agendadas"
        onLogout={onLogout}
      />

      <section className="coach-section coach-animate-in">
        <h2 className="coach-section-label">Próximas sesiones</h2>
        <div className="coach-group coach-glass">
          {upcoming.length === 0 ? (
            <div className="coach-row">
              <span className="coach-row-subtitle">No tienes sesiones próximas</span>
            </div>
          ) : (
            upcoming.map((item) => (
              <button
                key={item.id}
                type="button"
                className="coach-row coach-row--interactive"
                onClick={() => selectDate(item.date)}
              >
                <div className="coach-row-content">
                  <div className="coach-row-title">
                    {item.kind === "online" ? "Entrenamiento online" : "Sesión presencial"}
                  </div>
                  <div className="coach-row-subtitle">
                    {formatUpcomingDate(item.date)}
                    {item.kind === "presencial" && item.time ? ` · ${item.time}` : ""}
                  </div>
                </div>
                <span className="coach-chevron">›</span>
              </button>
            ))
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
          today={TODAY}
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
              <SessionRow key={item.id} item={item} student={student} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
