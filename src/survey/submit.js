import { supabase, SURVEY_TABLE } from "../lib/supabase.js";
import { buildStructuredAnswers } from "./utils.js";

export function mapAnswersToRow(survey, answers) {
  return {
    survey_slug: survey.slug,
    survey_title: survey.title,
    nombre: answers.nombre ?? null,
    email: answers.email ?? null,
    telefono: answers.telefono ?? null,
    marca: answers.marca ?? null,
    respuestas: buildStructuredAnswers(survey.sections, answers),
    raw: answers,
  };
}

export async function saveSurveyResponse(survey, answers) {
  if (!supabase) {
    return { ok: false, skipped: true, message: "Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY" };
  }

  try {
    const row = mapAnswersToRow(survey, answers);
    const { error } = await supabase.from(SURVEY_TABLE).insert(row);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e?.message ? String(e.message) : "Error desconocido",
    };
  }
}

export function buildWhatsAppMessage(survey, answers) {
  const lines = [
    `📋 *${survey.brand?.name ? `${survey.brand.name} — ` : ""}${survey.title}*`,
    "",
    `👤 *${answers.nombre || "Sin nombre"}*${answers.marca ? ` · ${answers.marca}` : ""}`,
    "",
  ];

  for (const section of survey.sections) {
    const sectionLines = [];
    for (const q of section.questions) {
      const val = answers[q.id];
      if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) continue;
      let formatted = val;
      if (Array.isArray(val)) formatted = val.join(", ");
      if (typeof val === "object" && !Array.isArray(val)) {
        formatted = Object.entries(val)
          .sort((a, b) => a[1] - b[1])
          .map(([k, v]) => `${v}. ${k}`)
          .join(", ");
      }
      sectionLines.push(`• ${q.text}`);
      sectionLines.push(`  → ${formatted}`);
    }
    if (sectionLines.length) {
      lines.push(`*${section.label.toUpperCase()}*`);
      lines.push(...sectionLines);
      lines.push("");
    }
  }

  lines.push(`_Enviado ${new Date().toLocaleString("es-CL")}_`);
  return lines.join("\n");
}

export function whatsappUrl(phone, message) {
  const digits = String(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
