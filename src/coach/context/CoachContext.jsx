import { createContext, useContext, useEffect, useState } from "react";
import { getCoachForUser } from "../../lib/auth.js";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../portal/context/AuthContext.jsx";

const CoachContext = createContext(null);

export function CoachProvider({ children }) {
  const { session } = useAuth();
  const [ready, setReady] = useState(false);
  const [coach, setCoach] = useState(null);

  const refresh = async () => {
    if (!supabase || !session) {
      setCoach(null);
      setReady(true);
      return;
    }
    const c = await getCoachForUser();
    setCoach(c);
    if (c?.theme) applyCoachTheme(c.theme);
    else applyCoachTheme(DEFAULT_COACH_THEME);
    setReady(true);
  };

  useEffect(() => {
    refresh();
  }, [session]);

  return (
    <CoachContext.Provider value={{ ready, coach, refresh }}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
