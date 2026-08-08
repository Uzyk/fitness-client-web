/** Agrupa feedback por nombre de ejercicio (más reciente primero en cada lista). */
export function indexFeedbackByExercise(items = []) {
  const byExercise = new Map();
  for (const item of items) {
    const key = item.exercise?.trim();
    if (!key) continue;
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key).push(item);
  }
  return byExercise;
}

export function getFeedbackForExercise(byExercise, exerciseName) {
  return byExercise.get(exerciseName?.trim()) || [];
}

export function getLatestFeedbackForExercise(byExercise, exerciseName) {
  return getFeedbackForExercise(byExercise, exerciseName)[0] || null;
}

export function getGeneralFeedback(items = []) {
  return items.filter((item) => !item.exercise?.trim());
}
