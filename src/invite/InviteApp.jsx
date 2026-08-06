import { useEffect, useState } from "react";
import { completeCoachOnboarding, getInvitation } from "../lib/adminApi.js";
import { applyCoachTheme } from "../lib/coachTheme.js";
import { signIn, signUp } from "../lib/auth.js";

export default function InviteApp() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getInvitation(token)
      .then((data) => {
        setInvite(data);
        if (data?.theme) applyCoachTheme(data.theme);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        const { data } = await signUp(invite.email, password, { full_name: invite.brand_name });
        if (!data.session) {
          setError("Revisa tu email para confirmar la cuenta, luego vuelve a este link.");
          return;
        }
      } else {
        await signIn(invite.email, password);
      }
      await completeCoachOnboarding(token);
      setDone(true);
      setTimeout(() => {
        window.location.href = "/app";
      }, 1500);
    } catch (err) {
      setError(err.message || "Error al crear cuenta");
    }
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
        <p>Redirigiendo a tu panel…</p>
      </div>
    );
  }

  return (
    <div className="invite-app">
      <p className="invite-eyebrow">Studio Fit</p>
      <h1 className="invite-title">Bienvenida, {invite.brand_name}</h1>
      <p className="invite-subtitle">Crea tu cuenta de coach</p>

      <form className="invite-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={invite.email} readOnly />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="invite-error">{error}</p>}
        <button type="submit" className="invite-btn">
          {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </form>

      <button
        type="button"
        className="invite-link"
        onClick={() => setMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup" ? "¿Ya tienes cuenta? Inicia sesión" : "¿Primera vez? Crear cuenta"}
      </button>
    </div>
  );
}
