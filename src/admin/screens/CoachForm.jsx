import { useState } from "react";
import PaletteEditor from "../../components/PaletteEditor.jsx";
import { createCoach, updateCoachTheme } from "../../lib/adminApi.js";
import { buildInviteUrl, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";

export default function CoachForm({ coach, onBack, onSaved }) {
  const isEdit = Boolean(coach);
  const [email, setEmail] = useState(coach?.email || "");
  const [theme, setTheme] = useState(coach?.theme || DEFAULT_COACH_THEME);
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await updateCoachTheme(coach.id, theme);
        onSaved?.();
      } else {
        const result = await createCoach({ email });
        setInviteUrl(buildInviteUrl(result.token));
      }
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (inviteUrl) {
    return (
      <div className="admin-success">
        <h2>Link de invitación listo</h2>
        <p>
          Envía este link a <strong>{email}</strong>. Allí configurará su nombre, marca y paleta de
          colores antes de crear su cuenta.
        </p>
        <div className="admin-invite-box">
          <code>{inviteUrl}</code>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => navigator.clipboard.writeText(inviteUrl)}
        >
          Copiar link
        </button>
        <button type="button" className="admin-btn-secondary" onClick={onBack}>
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="admin-back" onClick={onBack}>
        ‹ Volver
      </button>
      <h2 className="admin-section-title">{isEdit ? "Editar paleta" : "Invitar coach"}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        {!isEdit ? (
          <>
            <label>
              Email del coach
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@email.com"
                required
              />
            </label>
            <p className="admin-muted" style={{ marginTop: -8, marginBottom: 16 }}>
              Generaremos un link único. El coach definirá su nombre, marca y paleta al registrarse.
            </p>
          </>
        ) : (
          <div className="admin-form-section">
            <h3>Paleta de colores — {coach.brand_name}</h3>
            <PaletteEditor theme={theme} onChange={setTheme} variant="dark" />
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-btn-primary" disabled={loading}>
          {loading ? "Generando…" : isEdit ? "Guardar paleta" : "Generar link de invitación"}
        </button>
      </form>
    </div>
  );
}
