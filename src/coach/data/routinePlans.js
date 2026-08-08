import { normalizeRoutine } from "./exercisePrescription.js";

export function createRoutinePlan(name, exercises = []) {
  return {
    id: `rt-${Date.now()}`,
    name: name.trim() || "Nueva rutina",
    exercises: normalizeRoutine(exercises),
  };
}

export function ensureStudentRoutines(student) {
  const legacy = normalizeRoutine(student.routine || []);
  const routines = student.routines?.length
    ? student.routines.map((plan) => ({
        ...plan,
        exercises: normalizeRoutine(plan.exercises || []),
      }))
    : legacy.length
      ? [createRoutinePlan("Rutina principal", legacy)]
      : [];

  const activeRoutineId =
    student.activeRoutineId &&
    routines.some((plan) => plan.id === student.activeRoutineId)
      ? student.activeRoutineId
      : routines[0]?.id || null;

  return { routines, activeRoutineId };
}

export function getRoutineById(student, routineId) {
  const { routines } = ensureStudentRoutines(student);
  return routines.find((plan) => plan.id === routineId) || null;
}

export function getActiveRoutine(student) {
  const { routines, activeRoutineId } = ensureStudentRoutines(student);
  return routines.find((plan) => plan.id === activeRoutineId) || routines[0] || null;
}

export function getActiveRoutineName(student) {
  return getActiveRoutine(student)?.name || null;
}

export function getRoutineForDate(student, scheduleRows, dateKey, options = {}) {
  const { calendarOnly = false } = options;
  const { routines, activeRoutineId } = ensureStudentRoutines(student);
  const normalized = { ...student, routines, activeRoutineId };

  const sessionsToday = (scheduleRows || []).filter(
    (row) => row.student_id === normalized.id && row.schedule_date === dateKey,
  );

  if (calendarOnly && sessionsToday.length === 0) {
    return null;
  }

  const sessionWithRoutine = sessionsToday.find((row) => row.routine_id);
  if (sessionWithRoutine?.routine_id) {
    const plan = getRoutineById(normalized, sessionWithRoutine.routine_id);
    if (plan) return plan;
  }

  if (sessionsToday.length > 0) {
    return getActiveRoutine(normalized);
  }

  if (calendarOnly) {
    return null;
  }

  return getActiveRoutine(normalized);
}

export function getRoutineNameForSchedule(student, scheduleItem) {
  if (!scheduleItem?.routineId) return scheduleItem?.focus || null;
  return getRoutineById(student, scheduleItem.routineId)?.name || scheduleItem.focus || null;
}
