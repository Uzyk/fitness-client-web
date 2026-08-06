import { useMemo, useState } from "react";
import MonthCalendar, { REFERENCE_TODAY, toDateKey } from "../components/MonthCalendar.jsx";
import {
  getOnlineTrainingDatesSet,
  getSessionDatesSet,
  getUpcomingAgenda,
  getAgendaByDate,
  getStudent,
} from "../data/mock.js";
import ScreenHeader from "../components/ScreenHeader.jsx";
import { formatDayLong, parseDateKey } from "../utils/calendar.js";
import { modalityLabel } from "../theme.js";

function AgendaRow({ item, onOpenStudent }) {
  const student = getStudent(item.studentId);
  if (!student) return null;

  const isOnline = item.kind === "online";

  return (
    <button
      type="button"
      className="coach-row"
      onClick={() => onOpenStudent(item.studentId, isOnline ? "videos" : undefined)}
    >
      {isOnline ? (
        <span className="coach-day-dot coach-day-dot--online" aria-hidden />
      ) : (
        <span className="coach-day-dot coach-day-dot--presencial" aria-hidden />
      )}
      <div className="coach-row-content">
        <div className="coach-row-title">{student.name}</div>
        <div className="coach-row-subtitle">{modalityLabel(student.modality)}</div>
      </div>
      <span className="coach-chevron">›</span>
    </button>
  );
}

function formatUpcomingDate(dateKey) {
  const todayKey = toDateKey(REFERENCE_TODAY);
  if (dateKey === todayKey) return "Hoy";
  const tomorrow = new Date(REFERENCE_TODAY);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === toDateKey(tomorrow)) return "Mañana";
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
}

export default function CalendarScreen({ onOpenStudent }) {
  const [viewYear, setViewYear] = useState(REFERENCE_TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(REFERENCE_TODAY.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(REFERENCE_TODAY));

  const presencialDates = useMemo(() => getSessionDatesSet(), []);
  const onlineDates = useMemo(() => getOnlineTrainingDatesSet(), []);
  const upcoming = useMemo(() => getUpcomingAgenda(toDateKey(REFERENCE_TODAY), 5), []);
  const dayAgenda = useMemo(() => getAgendaByDate(selectedDateKey), [selectedDateKey]);

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
              const student = getStudent(item.studentId);
              const isOnline = item.kind === "online";
              return (
                <button
                  key={item.id}
                  type="button"
                  className="coach-row"
                  onClick={() => {
                    setSelectedDateKey(item.date);
                    setViewYear(parseDateKey(item.date).getFullYear());
                    setViewMonth(parseDateKey(item.date).getMonth());
                  }}
                >
                  <div className="coach-row-content">
                    <div className="coach-row-title">{student?.name}</div>
                    <div className="coach-row-subtitle">
                      {modalityLabel(student?.modality)}
                      {` · ${formatUpcomingDate(item.date)}`}
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
              <AgendaRow key={item.id} item={item} onOpenStudent={onOpenStudent} />
            ))
          )}
        </div>
      </section>

      <button type="button" className="coach-btn-primary" style={{ marginTop: 8 }}>
        + Agendar sesión
      </button>
    </div>
  );
}
