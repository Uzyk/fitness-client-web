import { supabase } from "./supabase.js";
import { getInvitation } from "./adminApi.js";

export async function getStudentInvitation(token) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("get_student_invitation", {
    p_token: token,
  });
  if (error) throw error;
  return data;
}

export async function completeStudentOnboarding(token, fullName) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("complete_student_onboarding", {
    p_token: token,
    p_full_name: fullName,
  });
  if (error) throw error;
  return data;
}

/** Resuelve token de invitación coach o alumno. */
export async function resolveInvitation(token) {
  const coachInvite = await getInvitation(token);
  if (coachInvite?.valid) {
    return { kind: "coach", ...coachInvite };
  }

  const studentInvite = await getStudentInvitation(token);
  if (studentInvite?.valid) {
    return { kind: "student", ...studentInvite };
  }

  return null;
}
