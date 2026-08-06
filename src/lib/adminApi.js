import { supabase } from "./supabase.js";

export async function fetchCoaches() {
  const { data, error } = await supabase
    .from("coaches")
    .select(`
      *,
      coach_invitations (
        token,
        expires_at,
        accepted_at,
        created_at
      )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCoach({ brandName, email, theme }) {
  const { data, error } = await supabase.rpc("admin_create_coach", {
    p_brand_name: brandName,
    p_email: email,
    p_theme: theme,
  });
  if (error) throw error;
  return data;
}

export async function updateCoachTheme(coachId, theme) {
  const { error } = await supabase.rpc("admin_update_coach_theme", {
    p_coach_id: coachId,
    p_theme: theme,
  });
  if (error) throw error;
}

export async function getInvitation(token) {
  const { data, error } = await supabase.rpc("get_coach_invitation", {
    p_token: token,
  });
  if (error) throw error;
  return data;
}

export async function completeCoachOnboarding(token) {
  const { data, error } = await supabase.rpc("complete_coach_onboarding", {
    p_token: token,
  });
  if (error) throw error;
  return data;
}
