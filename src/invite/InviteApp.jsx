import { useEffect, useState } from "react";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../lib/coachTheme.js";
import { resolveInvitation } from "../lib/inviteApi.js";
import CoachInviteSignup from "./CoachInviteSignup.jsx";
import StudentInviteSignup from "./StudentInviteSignup.jsx";

export default function InviteApp() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    applyCoachTheme(DEFAULT_COACH_THEME);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    resolveInvitation(token)
      .then((data) => {
        setInvite(data);
        if (data?.theme) {
          applyCoachTheme(data.theme);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDone = () => {
    setDone(true);
    setTimeout(() => {
      window.location.href = "/app";
    }, 1500);
  };

  if (!token) {
    return (
      <div className="invite-app">
        <p className="invite-error">Link de invitación inválido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="invite-app">
        <p>Cargando invitación…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-app">
        <p className="invite-error">{error}</p>
      </div>
    );
  }

  if (!invite?.valid) {
    return (
      <div className="invite-app">
        <h1>Invitación no válida</h1>
        <p>El link expiró o ya fue utilizado.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="invite-app">
        <h1>¡Cuenta lista!</h1>
        <p>Redirigiendo a la app…</p>
      </div>
    );
  }

  return (
    <div className="invite-app">
      {invite.kind === "student" ? (
        <StudentInviteSignup token={token} invite={invite} onDone={handleDone} />
      ) : (
        <CoachInviteSignup token={token} invite={invite} onDone={handleDone} />
      )}
    </div>
  );
}
