import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, getSession, onAuthChange, signIn, signOut } from "../../lib/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const refresh = async () => {
    const s = await getSession();
    setSession(s);
    if (s) {
      const p = await getProfile();
      setProfile(p);
    } else {
      setProfile(null);
    }
    setReady(true);
  };

  useEffect(() => {
    refresh();
    return onAuthChange(() => refresh());
  }, []);

  const login = async (email, password) => {
    await signIn(email, password);
    await refresh();
  };

  const logout = async () => {
    await signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ready,
        session,
        profile,
        role: profile?.role ?? null,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
