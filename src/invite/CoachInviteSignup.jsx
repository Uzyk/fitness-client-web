import { useEffect, useState } from "react";
import { completeCoachOnboarding } from "../lib/adminApi.js";
import { applyCoachTheme, DEFAULT_COACH_THEME } from "../lib/coachTheme.js";
import { signIn, signUp } from "../lib/auth.js";
import PaletteEditor from "../components/PaletteEditor.jsx";

export default function CoachInviteSignup({ token, invite, onDone }) {
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState(invite.brand_name || "");
  const [theme, setTheme] = useState({ ...DEFAULT_COACH_THEME, ...invite.theme });
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    applyCoachTheme(theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!brandName.trim()) {
      setError("Ingresa el nombre de tu marca");
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
      await completeCoachOnboarding(token, {
        fullName: fullName.trim(),
        brandName: brandName.trim(),
        theme,
      });
      onDone();
    } catch (err) {
      setError(err.message || "Error al crear cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="invite-eyebrow">Studio Fit</p>
      <h1 className="invite-title">Configura tu cuenta de coach</h1>
      <p className="invite-subtitle">
        Completa tu perfil, elige la paleta de tu marca y crea tu acceso.
      </p>

      <form className="invite-form" onSubmit={handleSubmit}>
        <fieldset className="invite-fieldset">
          <legend className="invite-legend">Tus datos</legend>
          <label>
            Tu nombre
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Vania Gaete"
              required
            />
          </label>
          <label>
            Nombre de tu marca
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej: Vania Fit Studio"
              required
            />
          </label>
          <p className="invite-hint">Así verán tu marca los alumnos en la app.</p>
        </fieldset>

        <fieldset className="invite-fieldset">
          <legend className="invite-legend">Paleta de colores</legend>
          <PaletteEditor theme={theme} onChange={setTheme} variant="light" />
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
