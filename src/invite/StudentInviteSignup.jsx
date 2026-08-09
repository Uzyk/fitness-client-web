import { useState } from "react";
import { formatCLP } from "../coach/data/studentData.js";
import { modalityDescription, modalityLabel } from "../coach/theme.js";
import { completeStudentOnboarding } from "../lib/inviteApi.js";
import { signIn, signUp } from "../lib/auth.js";

export default function StudentInviteSignup({ token, invite, onDone }) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Ingresa tu nombre");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data } = await signUp(invite.email, password, { full_name: fullName.trim() });
        if (!data.session) {
          setError("Revisa tu email para confirmar la cuenta, luego vuelve a este link.");
          return;
        }
      } else {
        await signIn(invite.email, password);
      }
      await completeStudentOnboarding(token, fullName.trim());
      onDone();
    } catch (err) {
      setError(err.message || "Error al crear cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="invite-eyebrow">{invite.coach_brand_name || "Tu coach"}</p>
      <h1 className="invite-title">Crea tu cuenta de alumno</h1>
      <p className="invite-subtitle">
        Tu coach te invitó a unirte. Confirma tus datos y elige una contraseña.
      </p>

      <div className="invite-info-card">
        <div className="invite-info-row">
          <span className="invite-info-label">Coach</span>
          <span className="invite-info-value">{invite.coach_brand_name}</span>
        </div>
        <div className="invite-info-row">
          <span className="invite-info-label">Modalidad</span>
          <span className="invite-info-value">{modalityLabel(invite.modality)}</span>
        </div>
        <div className="invite-info-row">
          <span className="invite-info-label">Cuota mensual</span>
          <span className="invite-info-value">{formatCLP(invite.monthly_fee)}</span>
        </div>
        <p className="invite-hint">{modalityDescription(invite.modality)}</p>
      </div>

      <form className="invite-form" onSubmit={handleSubmit}>
        <fieldset className="invite-fieldset">
          <legend className="invite-legend">Tus datos</legend>
          <label>
            Tu nombre
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Ana Pérez"
              required
            />
          </label>
        </fieldset>

        <fieldset className="invite-fieldset">
          <legend className="invite-legend">Acceso</legend>
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
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>
          <p className="invite-hint">
            La modalidad y el plan los define tu coach; podrás ver rutinas, calendario y pagos en la app.
          </p>
        </fieldset>

        {error && <p className="invite-error">{error}</p>}
        <button type="submit" className="invite-btn" disabled={submitting}>
          {submitting ? "Creando cuenta…" : mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </form>

      <button
        type="button"
        className="invite-link"
        onClick={() => setMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup" ? "¿Ya tienes cuenta? Inicia sesión" : "¿Primera vez? Crear cuenta"}
      </button>
    </>
  );
}
