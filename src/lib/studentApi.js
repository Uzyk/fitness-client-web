import { supabase } from "./supabase.js";
import { getAgendaByDate } from "../coach/data/studentData.js";
import { ensureStudentRoutines, getRoutineForDate } from "../coach/data/routinePlans.js";
import { buildSessionFeedbackForToday, findPreviousRoutineSession } from "./sessionFeedback.js";
import { toDateKey } from "../coach/utils/calendar.js";

function formatFeedbackDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

export async function fetchStudentProfile() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student, error } = await supabase
    .from("students")
    .select(`
      *,
      coaches (
        id,
        brand_name,
        theme,
        email
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!student) return null;

  const { data: feedback, error: fbError } = await supabase
    .from("student_feedback")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false });

  if (fbError) throw fbError;

  const todayKey = toDateKey(new Date());
  const { data: scheduleRows, error: scheduleError } = await supabase
    .from("coach_schedule")
    .select("*")
    .eq("student_id", student.id)
    .order("schedule_date");

  if (scheduleError) throw scheduleError;

  const todaySchedule = (scheduleRows || []).filter((row) => row.schedule_date === todayKey);
  const todayAgenda = getAgendaByDate(scheduleRows || [], todayKey);
  const primaryTodaySession = todayAgenda[0] || null;

  const mappedStudent = {
    routine: student.routine || [],
    routines: student.routines || [],
    activeRoutineId: student.active_routine_id,
    id: student.id,
  };
  const { routines, activeRoutineId } = ensureStudentRoutines(mappedStudent);
  const normalized = { ...mappedStudent, routines, activeRoutineId };
  const todayPlan = getRoutineForDate(normalized, scheduleRows || [], todayKey, {
    calendarOnly: true,
  });
  const hasSessionToday = todaySchedule.length > 0;
  const exerciseNames = todayPlan?.exercises?.map((ex) => ex.name) || [];
  const comments = (feedback || []).map((fb) => ({
    id: fb.id,
    date: formatFeedbackDate(fb.created_at),
    createdAt: fb.created_at,
    text: fb.body,
    exercise: fb.exercise,
  }));
  const sessionFeedbackByExercise = buildSessionFeedbackForToday({
    comments,
    schedule: scheduleRows || [],
    studentId: student.id,
    todayRoutineId: todayPlan?.id || null,
    todayKey,
    exerciseNames,
  });
  const previousSession = todayPlan?.id
    ? findPreviousRoutineSession(scheduleRows || [], student.id, todayPlan.id, todayKey)
    : null;

  return {
    id: student.id,
    name: student.full_name,
    email: student.email,
    modality: student.modality,
    monthlyFee: student.monthly_fee,
    paymentStatus: student.payment_status,
    alerts: student.alerts || { videos: 0, receipt: 0 },
    routines,
    activeRoutineId,
    todayRoutineId: todayPlan?.id || null,
    routineName: todayPlan?.name || null,
    hasSessionToday,
    todaySessionKind: primaryTodaySession?.kind || null,
    todaySessionTime: primaryTodaySession?.time || null,
    todaySessionPlace: primaryTodaySession?.place || null,
    previousSessionDate: previousSession?.schedule_date || null,
    sessionFeedbackByExercise: Object.fromEntries(sessionFeedbackByExercise),
    routine: todayPlan?.exercises || [],
    payments: student.payments || [],
    pendingVideos: student.pending_videos || [],
    schedule: scheduleRows || [],
    coach: student.coaches,
    comments,
  };
}

export async function submitPracticeVideo(exercise, routine = "", note = "") {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.rpc("student_submit_video", {
    p_exercise: exercise,
    p_routine: routine,
    p_note: note,
  });
  if (error) throw error;
}

export async function submitPaymentReceipt(file) {
  if (!supabase) throw new Error("Supabase no configurado");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión no válida");

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!student) throw new Error("Perfil de alumno no encontrado");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${student.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-receipts")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("payment-receipts").getPublicUrl(path);
  const receiptUrl = urlData?.publicUrl;
  if (!receiptUrl) throw new Error("No se pudo obtener la URL del comprobante");

  const { error } = await supabase.rpc("student_submit_receipt", {
    p_receipt_url: receiptUrl,
  });
  if (error) throw error;

  return receiptUrl;
}
