import { getLatestFeedbackForExercise, indexFeedbackByExercise } from "./feedbackByExercise.js";
import { parseDateKey } from "../coach/utils/calendar.js";

function startOfDateKey(dateKey) {
  return parseDateKey(dateKey);
}

/** Sesión anterior agendada con la misma rutina */
export function findPreviousRoutineSession(scheduleRows, studentId, routineId, beforeDateKey) {
  if (!routineId) return null;

  const matches = (scheduleRows || [])
    .filter(
      (row) =>
        row.student_id === studentId &&
        row.routine_id === routineId &&
        row.schedule_date < beforeDateKey,
    )
    .sort((a, b) => b.schedule_date.localeCompare(a.schedule_date));

  return matches[0] || null;
}

/** Feedback entre la sesión anterior y hoy (misma rutina) */
export function getFeedbackBetweenSessions(comments, { fromDateKey, toDateKey, exerciseNames }) {
  if (!fromDateKey || !toDateKey) return [];

  const nameSet = new Set(exerciseNames || []);
  const fromMs = startOfDateKey(fromDateKey).getTime();
  const toMs = startOfDateKey(toDateKey).getTime();

  return (comments || []).filter((item) => {
    if (!item.exercise?.trim() || !nameSet.has(item.exercise.trim())) return false;
    if (!item.createdAt) return false;
    const ts = new Date(item.createdAt).getTime();
    return ts >= fromMs && ts < toMs;
  });
}

/** Último feedback por ejercicio de la sesión anterior (Inicio) */
export function buildSessionFeedbackForToday({
  comments,
  schedule,
  studentId,
  todayRoutineId,
  todayKey,
  exerciseNames,
}) {
  if (!todayRoutineId || !exerciseNames?.length) {
    return new Map();
  }

  const previous = findPreviousRoutineSession(schedule, studentId, todayRoutineId, todayKey);
  if (!previous) {
    return new Map();
  }

  const windowFeedback = getFeedbackBetweenSessions(comments, {
    fromDateKey: previous.schedule_date,
    toDateKey: todayKey,
    exerciseNames,
  });

  const indexed = indexFeedbackByExercise(windowFeedback);
  const result = new Map();
  for (const name of exerciseNames) {
    const latest = getLatestFeedbackForExercise(indexed, name);
    if (latest) result.set(name, latest);
  }
  return result;
}

/** Feedback histórico por ejercicio de una rutina (pestaña Rutina) */
export function buildRoutineFeedback(comments, routine) {
  if (!routine?.exercises?.length) return new Map();

  const nameSet = new Set(routine.exercises.map((ex) => ex.name));
  const filtered = (comments || []).filter(
    (item) => item.exercise?.trim() && nameSet.has(item.exercise.trim()),
  );
  return indexFeedbackByExercise(filtered);
}

export { getLatestFeedbackForExercise };
