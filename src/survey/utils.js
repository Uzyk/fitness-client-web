export function countAnswered(answers) {
  return Object.keys(answers).filter((k) => {
    const v = answers[k];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "object" && v !== null) return Object.keys(v).length > 0;
    return false;
  }).length;
}

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
}

export function questionAnswered(question, answers) {
  const val = answers[question.id];
  if (!question.required) return true;
  if (question.type === "multi") return Array.isArray(val) && val.length > 0;
  if (question.type === "rank") {
    return (
      typeof val === "object" &&
      val !== null &&
      question.options &&
      Object.keys(val).length === question.options.length
    );
  }
  if (["open", "text", "email", "tel"].includes(question.type)) {
    return typeof val === "string" && val.trim().length > 0;
  }
  if (question.type === "single") return !!val;
  return false;
}

export function getTotalQuestions(sections) {
  return sections.flatMap((s) => s.questions).length;
}

export function getGlobalStep(sections, sectionIdx, questionIdx) {
  return sections.slice(0, sectionIdx).reduce((acc, s) => acc + s.questions.length, 0) + questionIdx + 1;
}

export function buildStructuredAnswers(sections, answers) {
  const questionMap = {};
  sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      questionMap[q.id] = { section: sec.label, question: q.text, type: q.type };
    });
  });

  return Object.entries(answers)
    .filter(([id]) => questionMap[id])
    .map(([id, val]) => {
      const meta = questionMap[id];
      let respuesta = val;
      if (meta.type === "rank" && typeof val === "object" && val !== null) {
        respuesta = Object.entries(val)
          .sort((a, b) => a[1] - b[1])
          .map(([opt, rank]) => `${rank}. ${opt}`);
      }
      return { seccion: meta.section, pregunta: meta.question, respuesta };
    });
}
