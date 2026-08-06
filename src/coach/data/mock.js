/** Mock data — reemplazar con Supabase en fase backend */

import { REFERENCE_TODAY, toDateKey, parseDateKey } from "../utils/calendar.js";

export { REFERENCE_TODAY };

export const coach = {
  name: "Vania",
  brand: "Vania Gaete",
  monthLabel: "Agosto 2026",
};

export const students = [
  {
    id: "ana",
    name: "Ana Ruiz",
    modality: "online",
    monthlyFee: 70000,
    billingDay: 5,
    paymentStatus: "pending",
    alerts: { videos: 2, receipt: 0 },
    nextSession: null,
    pendingVideos: [
      {
        id: "v1",
        exercise: "Sentadilla",
        routine: "3×8 · 40 kg",
        sentAt: "Hoy, 14:20",
        note: "¿Bajo más el peso?",
        thumbnail: null,
      },
      {
        id: "v2",
        exercise: "Peso muerto",
        routine: "3×6 · 50 kg",
        sentAt: "Ayer, 19:10",
        note: "",
        thumbnail: null,
      },
    ],
    recentFeedback: [
      {
        id: "f1",
        date: "04/08",
        type: "online",
        exercise: "Press banca",
        text: "Más profundidad, rodillas alineadas con los pies.",
      },
    ],
    routine: [
      { id: "r1", name: "Sentadilla", detail: "3×8 · 40 kg", videoStatus: "pending" },
      { id: "r2", name: "Peso muerto", detail: "3×6 · 50 kg", videoStatus: "pending" },
      { id: "r3", name: "Press banca", detail: "3×8 · 35 kg", videoStatus: "done" },
    ],
    payments: [
      { month: "Agosto 2026", amount: 70000, status: "pending" },
      { month: "Julio 2026", amount: 70000, status: "paid", confirmedAt: "04/07" },
    ],
  },
  {
    id: "juan",
    name: "Juan Pérez",
    modality: "online",
    monthlyFee: 45000,
    billingDay: 1,
    paymentStatus: "review",
    alerts: { videos: 0, receipt: 1 },
    nextSession: null,
    pendingVideos: [],
    recentFeedback: [],
    routine: [
      { id: "r1", name: "Dominadas asistidas", detail: "4×6", videoStatus: "none" },
      { id: "r2", name: "Remo con mancuerna", detail: "3×10 · 12 kg", videoStatus: "none" },
    ],
    payments: [
      { month: "Agosto 2026", amount: 45000, status: "review", submittedAt: "Hoy" },
      { month: "Julio 2026", amount: 45000, status: "paid", confirmedAt: "02/07" },
    ],
  },
  {
    id: "maria",
    name: "María López",
    modality: "presencial",
    monthlyFee: 70000,
    billingDay: 5,
    paymentStatus: "paid",
    alerts: { videos: 0, receipt: 0 },
    nextSession: { date: "Hoy", time: "10:00", type: "presencial", place: "Gimnasio" },
    pendingVideos: [],
    recentFeedback: [
      {
        id: "f1",
        date: "06/08",
        type: "presencial",
        exercise: "Press banca",
        text: "Bajar peso, controlar codos.",
      },
    ],
    routine: [],
    payments: [{ month: "Agosto 2026", amount: 70000, status: "paid", confirmedAt: "04/08" }],
  },
  {
    id: "pedro",
    name: "Pedro Soto",
    modality: "presencial",
    monthlyFee: 45000,
    billingDay: 1,
    paymentStatus: "overdue",
    alerts: { videos: 0, receipt: 0 },
    nextSession: null,
    pendingVideos: [],
    recentFeedback: [],
    routine: [],
    payments: [{ month: "Agosto 2026", amount: 45000, status: "overdue" }],
  },
];

/**
 * Entrenamientos online programados (sin videollamada).
 * Aparecen en "Hoy" y calendario junto a las sesiones presenciales.
 */
export const onlineTrainings = [
  { id: "ot1", studentId: "juan", date: "2026-08-06", focus: "Pierna" },
  { id: "ot2", studentId: "ana", date: "2026-08-06", focus: "Tren superior" },
  { id: "ot3", studentId: "juan", date: "2026-08-08", focus: "Espalda" },
  { id: "ot4", studentId: "ana", date: "2026-08-12", focus: "Pierna" },
  { id: "ot5", studentId: "juan", date: "2026-08-14", focus: "Full body" },
  { id: "ot6", studentId: "ana", date: "2026-08-19", focus: "Glúteos" },
];

/** Sesiones presenciales agendadas en gimnasio */
export const sessions = [
  {
    id: "s1",
    studentId: "maria",
    date: "2026-08-06",
    time: "10:00",
    type: "presencial",
    place: "Gimnasio",
    status: "scheduled",
  },
  {
    id: "s4",
    studentId: "pedro",
    date: "2026-08-09",
    time: "16:00",
    type: "presencial",
    place: "Gimnasio",
    status: "scheduled",
  },
  {
    id: "s5",
    studentId: "maria",
    date: "2026-08-12",
    time: "10:00",
    type: "presencial",
    place: "Gimnasio",
    status: "scheduled",
  },
  {
    id: "s8",
    studentId: "maria",
    date: "2026-08-19",
    time: "10:00",
    type: "presencial",
    place: "Gimnasio",
    status: "scheduled",
  },
];

export function getOnlineTrainingsByDate(dateKey) {
  return onlineTrainings.filter((t) => t.date === dateKey);
}

export function getOnlineTrainingDatesSet() {
  return new Set(onlineTrainings.map((t) => t.date));
}

/** Presencial + online del día, para la sección "Hoy" */
export function getTodayAgenda(today = REFERENCE_TODAY) {
  const key = toDateKey(today);
  const items = [];

  for (const session of getSessionsByDate(key)) {
    items.push({ ...session, kind: "presencial", sortKey: session.time });
  }

  for (const training of getOnlineTrainingsByDate(key)) {
    items.push({ ...training, kind: "online", sortKey: "24:00" });
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function getAgendaByDate(dateKey) {
  const items = [];

  for (const session of getSessionsByDate(dateKey)) {
    items.push({ ...session, kind: "presencial", sortKey: session.time });
  }

  for (const training of getOnlineTrainingsByDate(dateKey)) {
    items.push({ ...training, kind: "online", sortKey: "24:00" });
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

/** Próximos ítems del calendario (presencial + online) */
export function getUpcomingAgenda(fromDate, limit = 5) {
  const fromKey = typeof fromDate === "string" ? fromDate : toDateKey(fromDate);
  const items = [];

  for (const session of sessions) {
    if (session.date >= fromKey) {
      items.push({ ...session, kind: "presencial", sortKey: `${session.date}${session.time}` });
    }
  }
  for (const training of onlineTrainings) {
    if (training.date >= fromKey) {
      items.push({ ...training, kind: "online", sortKey: `${training.date}24:00` });
    }
  }

  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(0, limit);
}

export function getSessionsByDate(dateKey) {
  return sessions
    .filter((s) => s.date === dateKey)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getSessionDatesSet() {
  return new Set(sessions.map((s) => s.date));
}

export function getUpcomingSessions(fromDate, limit = 5) {
  const fromKey = typeof fromDate === "string" ? fromDate : toDateKey(fromDate);
  return sessions
    .filter((s) => s.date >= fromKey)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, limit);
}

export function getTodaySessionsFromSchedule(today = REFERENCE_TODAY) {
  return getSessionsByDate(toDateKey(today));
}

export function getStudent(id) {
  return students.find((s) => s.id === id);
}

export function getAttentionItems() {
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

export function getPaymentSummary() {
  const paid = students.filter((s) => s.paymentStatus === "paid").length;
  const pending = students.filter((s) => s.paymentStatus === "pending" || s.paymentStatus === "review").length;
  const overdue = students.filter((s) => s.paymentStatus === "overdue").length;
  return { paid, pending, overdue, total: students.length };
}

export function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}
