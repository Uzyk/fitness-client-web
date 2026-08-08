import { toDateKey } from "../utils/calendar.js";
import { mapScheduleItem } from "../../lib/coachDataApi.js";
import { modalityLabel } from "../theme.js";

export function getStudent(students, id) {
  return students.find((s) => s.id === id);
}

export function getAttentionItems(students) {
  const items = [];
  for (const s of students) {
    if (s.alerts.receipt > 0) {
      items.push({
        id: `${s.id}-receipt`,
        studentId: s.id,
        studentName: s.name,
        kind: "receipt",
        label: "Comprobante por confirmar",
        priority: 1,
      });
    }
    if (s.alerts.videos > 0) {
      items.push({
        id: `${s.id}-videos`,
        studentId: s.id,
        studentName: s.name,
        kind: "videos",
        label: `${s.alerts.videos} video${s.alerts.videos > 1 ? "s" : ""} por revisar`,
        priority: 2,
      });
    }
    if (s.paymentStatus === "overdue") {
      items.push({
        id: `${s.id}-overdue`,
        studentId: s.id,
        studentName: s.name,
        kind: "overdue",
        label: "Pago atrasado",
        priority: 3,
      });
    }
  }
  return items.sort((a, b) => a.priority - b.priority);
}

export function getPaymentSummary(students) {
  const paid = students.filter((s) => s.paymentStatus === "paid").length;
  const pending = students.filter((s) => s.paymentStatus === "pending" || s.paymentStatus === "review").length;
  const overdue = students.filter((s) => s.paymentStatus === "overdue").length;
  return { paid, pending, overdue, total: students.length };
}

function getMappedSchedule(scheduleRows) {
  return scheduleRows.map(mapScheduleItem);
}

export function getOnlineTrainingsByDate(scheduleRows, dateKey) {
  return getMappedSchedule(scheduleRows).filter(
    (item) => item.kind === "online" && item.date === dateKey,
  );
}

export function getSessionsByDate(scheduleRows, dateKey) {
  return getMappedSchedule(scheduleRows)
    .filter((item) => item.kind === "presencial" && item.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getSessionDatesSet(scheduleRows) {
  return new Set(
    getMappedSchedule(scheduleRows)
      .filter((item) => item.kind === "presencial")
      .map((item) => item.date),
  );
}

export function getOnlineTrainingDatesSet(scheduleRows) {
  return new Set(
    getMappedSchedule(scheduleRows)
      .filter((item) => item.kind === "online")
      .map((item) => item.date),
  );
}

export function getTodayAgenda(scheduleRows, today = new Date()) {
  const key = toDateKey(today);
  const items = [];

  for (const session of getSessionsByDate(scheduleRows, key)) {
    items.push({ ...session, kind: "presencial", sortKey: session.time });
  }

  for (const training of getOnlineTrainingsByDate(scheduleRows, key)) {
    items.push({ ...training, kind: "online", sortKey: "24:00" });
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function getAgendaByDate(scheduleRows, dateKey) {
  const items = [];

  for (const session of getSessionsByDate(scheduleRows, dateKey)) {
    items.push({ ...session, kind: "presencial", sortKey: session.time });
  }

  for (const training of getOnlineTrainingsByDate(scheduleRows, dateKey)) {
    items.push({ ...training, kind: "online", sortKey: "24:00" });
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function getUpcomingAgenda(scheduleRows, fromDate, limit = 5) {
  const fromKey = typeof fromDate === "string" ? fromDate : toDateKey(fromDate);
  const mapped = getMappedSchedule(scheduleRows);
  const items = [];

  for (const item of mapped) {
    if (item.date >= fromKey) {
      const sortKey =
        item.kind === "presencial" ? `${item.date}${item.time}` : `${item.date}24:00`;
      items.push({ ...item, sortKey });
    }
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(0, limit);
}

/** Subtítulo corto para una sesión agendada (tipo, hora, lugar). */
export function formatAgendaSubtitle(item) {
  if (!item) return "";
  const parts = [];
  if (item.kind === "presencial") {
    if (item.time) parts.push(item.time);
    if (item.place) parts.push(item.place);
    parts.push(modalityLabel("presencial"));
  } else {
    parts.push(modalityLabel("online"));
    if (item.focus) parts.push(item.focus);
  }
  return parts.join(" · ");
}

export function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthLabel(date = new Date()) {
  const label = date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Comprobante más reciente o el pendiente de revisión */
export function getStudentReceipt(student) {
  if (!student?.payments?.length) return null;

  const payments = student.payments;
  const pendingReview = payments.find((p) => p.status === "review");
  if (pendingReview) return pendingReview;

  const withUrl = payments.filter((p) => p.receiptUrl);
  if (withUrl.length) return withUrl[withUrl.length - 1];

  return payments[payments.length - 1];
}
