const DEFAULT_SETS = 3;
const DEFAULT_REPS = 12;

/** Formato estándar: "3×8 · 40 kg" o "4×6" sin peso */
export function formatExerciseDetail({ sets, reps, weightKg }) {
  const s = Math.max(1, Number(sets) || DEFAULT_SETS);
  const r = Math.max(1, Number(reps) || DEFAULT_REPS);
  const base = `${s}×${r}`;
  const weight = Number(weightKg);
  if (weightKg !== "" && weightKg != null && !Number.isNaN(weight) && weight > 0) {
    return `${base} · ${weight} kg`;
  }
  return base;
}

/** Parsea detail legado o estándar a valores editables */
export function parseExerciseDetail(detail) {
  if (!detail || typeof detail !== "string") {
    return { sets: DEFAULT_SETS, reps: DEFAULT_REPS, weightKg: "" };
  }

  const standard = detail.match(/(\d+)\s*[×x]\s*(\d+)(?:\s*[·•]\s*(\d+(?:[.,]\d+)?)\s*kg)?/i);
  if (standard) {
    return {
      sets: Number(standard[1]),
      reps: Number(standard[2]),
      weightKg: standard[3]
        ? String(Number(standard[3].replace(",", ".")))
        : "",
    };
  }

  const legacy = detail.match(/(\d+)\s*series?\s*[×x]\s*(\d+)\s*reps?/i);
  if (legacy) {
    return {
      sets: Number(legacy[1]),
      reps: Number(legacy[2]),
      weightKg: "",
    };
  }

  return { sets: DEFAULT_SETS, reps: DEFAULT_REPS, weightKg: "" };
}

export function getExercisePrescription(exercise) {
  if (exercise?.sets != null && exercise?.reps != null) {
    return {
      sets: exercise.sets,
      reps: exercise.reps,
      weightKg: exercise.weightKg ?? "",
    };
  }
  return parseExerciseDetail(exercise?.detail);
}

export function formatExerciseDisplay(exercise) {
  return formatExerciseDetail(getExercisePrescription(exercise));
}

/** Asegura detail + sets/reps/weightKg coherentes antes de guardar */
export function normalizeExercise(exercise) {
  const prescription = getExercisePrescription(exercise);
  const weight = prescription.weightKg === "" ? undefined : Number(prescription.weightKg);

  return {
    ...exercise,
    sets: prescription.sets,
    reps: prescription.reps,
    weightKg: weight,
    detail: formatExerciseDetail(prescription),
  };
}

export function normalizeRoutine(routine = []) {
  return routine.map(normalizeExercise);
}

export const PRESCRIPTION_DEFAULTS = {
  sets: DEFAULT_SETS,
  reps: DEFAULT_REPS,
  weightKg: "",
};
