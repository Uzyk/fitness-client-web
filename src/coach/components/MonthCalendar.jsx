import {
  WEEKDAYS,
  formatMonthYear,
  getMonthGrid,
  isSameDay,
  REFERENCE_TODAY,
  toDateKey,
} from "../utils/calendar.js";

export default function MonthCalendar({
  year,
  month,
  selectedDateKey,
  presencialDates,
  onlineDates,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  today = REFERENCE_TODAY,
}) {
  const cells = getMonthGrid(year, month);

  return (
    <div className="coach-calendar">
      <div className="coach-calendar-header">
        <button type="button" className="coach-calendar-nav" onClick={onPrevMonth} aria-label="Mes anterior">
          ‹
        </button>
        <h2 className="coach-calendar-month">{formatMonthYear(year, month)}</h2>
        <button type="button" className="coach-calendar-nav" onClick={onNextMonth} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="coach-calendar-weekdays">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`} className="coach-calendar-weekday">
            {d}
          </span>
        ))}
      </div>

      <div className="coach-calendar-grid" role="grid" aria-label={formatMonthYear(year, month)}>
        {cells.map((cell) => {
          if (cell.type === "empty") {
            return <div key={cell.key} className="coach-calendar-cell coach-calendar-cell--empty" />;
          }

          const dateKey = cell.key;
          const hasPresencial = presencialDates.has(dateKey);
          const hasOnline = onlineDates.has(dateKey);
          const hasAny = hasPresencial || hasOnline;
          const isSelected = selectedDateKey === dateKey;
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={dateKey}
              type="button"
              role="gridcell"
              className={[
                "coach-calendar-cell",
                "coach-calendar-cell--day",
                isSelected && "coach-calendar-cell--selected",
                isToday && "coach-calendar-cell--today",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDay(dateKey)}
              aria-label={`${cell.day}${hasAny ? ", con sesiones" : ""}${isToday ? ", hoy" : ""}`}
              aria-selected={isSelected}
            >
              <span className="coach-calendar-day-num">{cell.day}</span>
              {hasAny && (
                <span className="coach-calendar-dots" aria-hidden>
                  {hasPresencial && <span className="coach-calendar-dot coach-calendar-dot--presencial" />}
                  {hasOnline && <span className="coach-calendar-dot coach-calendar-dot--online" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toDateKey, REFERENCE_TODAY };
