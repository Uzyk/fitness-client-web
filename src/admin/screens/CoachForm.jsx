import { useState } from "react";
import PaletteEditor from "../components/PaletteEditor.jsx";
import { createCoach, updateCoachTheme } from "../../lib/adminApi.js";
import { buildInviteUrl, DEFAULT_COACH_THEME } from "../../lib/coachTheme.js";

export default function CoachForm({ coach, onBack, onSaved }) {
  const isEdit = Boolean(coach);
  const [brandName, setBrandName] = useState(coach?.brand_name || "");
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
        const result = await createCoach({ brandName, email, theme });
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
        <h2>Coach creado</h2>
        <p>Envía este link al correo <strong>{email}</strong> para que cree su cuenta:</p>
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
      <h2 className="admin-section-title">{isEdit ? "Editar paleta" : "Nuevo coach"}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        {!isEdit && (
          <>
            <label>
              Marca / nombre del coach
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ej: Vania Gaete"
                required
              />
            </label>
            <label>
              Email (recibirá la invitación)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@email.com"
                required
              />
            </label>
          </>
        )}

        <div className="admin-form-section">
          <h3>Paleta de colores</h3>
          <PaletteEditor theme={theme} onChange={setTheme} />
        </div>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-btn-primary" disabled={loading}>
          {loading ? "Guardando…" : isEdit ? "Guardar paleta" : "Crear e invitar"}
        </button>
      </form>
    </div>
  );
}
