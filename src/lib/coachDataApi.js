import { supabase } from "./supabase.js";

import { ensureStudentRoutines } from "../coach/data/routinePlans.js";

function formatFeedbackDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

function mapStudent(row, feedback = []) {
  const modality = row.modality;
  const { routines, activeRoutineId } = ensureStudentRoutines({
    routine: row.routine || [],
    routines: row.routines || [],
    activeRoutineId: row.active_routine_id,
  });

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    modality,
    monthlyFee: row.monthly_fee,
    billingDay: row.billing_day,
    paymentStatus: row.payment_status,
    alerts: row.alerts || { videos: 0, receipt: 0 },
    nextSession: row.next_session,
    pendingVideos: row.pending_videos || [],
    routines,
    activeRoutineId,
    activeRoutineName: routines.find((plan) => plan.id === activeRoutineId)?.name || null,
    routine: routines.find((plan) => plan.id === activeRoutineId)?.exercises || row.routine || [],
    payments: row.payments || [],
    recentFeedback: feedback.map((fb) => ({
      id: fb.id,
      date: formatFeedbackDate(fb.created_at),
      type: modality === "online" ? "online" : "presencial",
      exercise: fb.exercise || null,
      text: fb.body,
    })),
  };
}

export async function fetchStudentsForCoach(coachId) {
  if (!supabase || !coachId) return [];

  const { data: rows, error } = await supabase
    .from("students")
    .select("*")
    .eq("coach_id", coachId)
    .order("full_name");

  if (error) throw error;
  if (!rows?.length) return [];

  const studentIds = rows.map((r) => r.id);
  const { data: feedbackRows, error: fbError } = await supabase
    .from("student_feedback")
    .select("*")
    .in("student_id", studentIds)
    .order("created_at", { ascending: false });

  if (fbError) throw fbError;

  return rows.map((row) => {
    const studentFeedback = (feedbackRows || []).filter((fb) => fb.student_id === row.id);
    return mapStudent(row, studentFeedback);
  });
}

export async function fetchScheduleForCoach(coachId) {
  if (!supabase || !coachId) return [];

  const { data, error } = await supabase
    .from("coach_schedule")
    .select("*")
    .eq("coach_id", coachId)
    .order("schedule_date");

  if (error) throw error;
  return data || [];
}

export async function addCoachComment(studentId, body, exercise = null) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("coach_add_comment", {
    p_student_id: studentId,
    p_body: body,
    p_exercise: exercise || null,
  });
  if (error) throw error;
  return data;
}

export async function publishVideoFeedback(studentId, videoId, body, exercise = null) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_publish_video_feedback", {
    p_student_id: studentId,
    p_video_id: videoId,
    p_body: body,
    p_exercise: exercise,
  });
  if (error) throw error;
}

export async function markPaymentPaid(studentId) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_mark_payment_paid", { p_student_id: studentId });
  if (error) throw error;
}

export async function requestReceipt(studentId) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_request_receipt", { p_student_id: studentId });
  if (error) throw error;
}

export async function updateStudentRoutines(studentId, routines, activeRoutineId) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_update_student", {
    p_student_id: studentId,
    p_patch: { routines, active_routine_id: activeRoutineId },
  });
  if (error) throw error;
}

export async function updateStudentProfile(studentId, profile) {
  if (!supabase) throw new Error("Supabase no configurado");

  const patch = {};
  if (profile.fullName != null) patch.full_name = profile.fullName.trim();
  if (profile.modality != null) patch.modality = profile.modality;
  if (profile.monthlyFee != null) patch.monthly_fee = profile.monthlyFee;
  if (profile.billingDay !== undefined) {
    patch.billing_day = profile.billingDay === "" || profile.billingDay == null
      ? null
      : Number(profile.billingDay);
  }
  if (profile.paymentStatus != null) patch.payment_status = profile.paymentStatus;

  const { error } = await supabase.rpc("coach_update_student", {
    p_student_id: studentId,
    p_patch: patch,
  });
  if (error) throw error;
}

/** @deprecated use updateStudentRoutines */
export async function updateStudentRoutine(studentId, routine) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_update_student", {
    p_student_id: studentId,
    p_patch: { routine },
  });
  if (error) throw error;
}

export async function addScheduleEntry(studentId, { date, kind, time, place, focus, routineId }) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("coach_add_schedule", {
    p_student_id: studentId,
    p_date: date,
    p_kind: kind,
    p_time: time || null,
    p_place: place || null,
    p_focus: focus || null,
    p_routine_id: routineId || null,
  });
  if (error) throw error;
  return data;
}

export async function createStudent({ fullName, email, modality = "online", monthlyFee = 70000 }) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("coach_create_student", {
    p_full_name: fullName,
    p_email: email,
    p_modality: modality,
    p_monthly_fee: monthlyFee,
  });
  if (error) throw error;
  return data;
}

export async function sendPaymentReminder(studentId) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("coach_add_comment", {
    p_student_id: studentId,
    p_body: "Recordatorio: tienes un pago pendiente este mes. Por favor regulariza cuando puedas.",
  });
  if (error) throw error;
}

export function mapScheduleItem(row) {
  const dateKey = row.schedule_date;
  const kind = String(row.kind || "").trim().toLowerCase();
  if (kind === "presencial") {
    return {
      id: row.id,
      studentId: row.student_id,
      date: dateKey,
      time: row.schedule_time?.slice(0, 5) || "09:00",
      type: "presencial",
      place: row.place || "Gimnasio",
      status: "scheduled",
      kind: "presencial",
      routineId: row.routine_id || null,
      focus: row.focus || null,
    };
  }
  return {
    id: row.id,
    studentId: row.student_id,
    date: dateKey,
    focus: row.focus || "Entrenamiento",
    kind: "online",
    routineId: row.routine_id || null,
  };
}
