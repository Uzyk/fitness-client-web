const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Fecha de referencia para demo (alineada con mock) */
export const REFERENCE_TODAY = new Date(2026, 7, 6); // 6 agosto 2026

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDayLong(dateKey) {
  const date = parseDateKey(dateKey);
  const weekday = date.toLocaleDateString("es-CL", { weekday: "long" });
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${month}`;
}

export function formatMonthYear(year, month) {
  return `${MONTHS[month]} ${year}`;
}

/** Celdas del mes incluyendo padding (lunes = primera columna) */
export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Lunes=0 … Domingo=6
  let startPad = first.getDay() - 1;
  if (startPad < 0) startPad = 6;

  const cells = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ type: "empty", key: `pad-start-${i}` });
  }

  for (let day = 1; day <= last.getDate(); day++) {
    const date = new Date(year, month, day);
    cells.push({
      type: "day",
      key: toDateKey(date),
      date,
      day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: "empty", key: `pad-end-${cells.length}` });
  }

  return cells;
}

export { WEEKDAYS, MONTHS };
