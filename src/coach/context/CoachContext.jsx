import { createContext, useContext, useEffect, useState } from "react";
import { getCoachForUser, getSession, onAuthChange, signIn, signOut } from "../../lib/auth.js";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";
import { supabase } from "../../lib/supabase.js";

const CoachContext = createContext(null);

export function CoachProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [coach, setCoach] = useState(null);

  const refresh = async () => {
    if (!supabase) {
      setSession({ demo: true });
      setCoach({
        brand_name: "Vania Gaete",
        theme: DEFAULT_COACH_THEME,
        status: "active",
      });
      applyCoachTheme(DEFAULT_COACH_THEME);
      setReady(true);
      return;
    }
    const s = await getSession();
    setSession(s);
    if (s) {
      const c = await getCoachForUser();
      setCoach(c);
      if (c?.theme) applyCoachTheme(c.theme);
    } else {
      setCoach(null);
    }
    setReady(true);
  };

  useEffect(() => {
    refresh();
    return onAuthChange(() => refresh());
  }, []);

  return (
    <CoachContext.Provider value={{ ready, session, coach, refresh, signIn, signOut }}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
