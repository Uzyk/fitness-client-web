import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getProfile, getSession, onAuthChange, signIn, signOut } from "../../lib/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const refreshPromiseRef = useRef(null);

  const refresh = () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const s = await getSession();
        if (s) {
          const p = await getProfile();
          setSession(s);
          setProfile(p);
        } else {
          setSession(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("AuthContext refresh:", err);
        setSession(null);
        setProfile(null);
      } finally {
        setReady(true);
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  };

  const login = async (email, password) => {
    await signIn(email, password);
    await refresh();
  };

  useEffect(() => {
    refresh();
    return onAuthChange(() => {
      queueMicrotask(() => refresh());
    });
  }, []);

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
