import { useEffect, useState } from "react";
import { deleteCoach, fetchCoaches } from "../../lib/adminApi.js";
import { buildInviteUrl } from "../../lib/coachTheme.js";

const STATUS_LABEL = {
  invited: "Invitado",
  active: "Activo",
  suspended: "Suspendido",
};

export default function CoachList({ onAdd, onEdit, onManageStudents }) {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCoaches();
      setCoaches(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyInvite = (token, id) => {
    navigator.clipboard.writeText(buildInviteUrl(token));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (coach) => {
    const label = coach.brand_name === "Pendiente" ? coach.email : coach.brand_name;
    const ok = window.confirm(
      `¿Eliminar al coach "${label}"?\n\nSe borrarán también todos sus alumnos, invitaciones y datos asociados. Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setDeleting(coach.id);
    try {
      await deleteCoach(coach.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const latestInvite = (coach) => {
    const invites = coach.coach_invitations || [];
    return invites.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  };

  if (loading) return <p className="admin-muted">Cargando coaches…</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-section-title">Coaches</h2>
        <button type="button" className="admin-btn-primary admin-btn-sm" onClick={onAdd}>
          + Agregar coach
        </button>
      </div>

      {coaches.length === 0 ? (
        <p className="admin-muted">No hay coaches registrados.</p>
      ) : (
        <div className="admin-list">
          {coaches.map((coach) => {
            const invite = latestInvite(coach);
            const pending = coach.status === "invited" && invite && !invite.accepted_at;
            return (
              <div key={coach.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>{coach.brand_name === "Pendiente" ? coach.email : coach.brand_name}</h3>
                    <p className="admin-muted">
                      {coach.brand_name === "Pendiente" ? "Invitación pendiente" : coach.email}
                    </p>
                  </div>
                  <span className={`admin-badge admin-badge--${coach.status}`}>
                    {STATUS_LABEL[coach.status] || coach.status}
                  </span>
                </div>
                <div
                  className="admin-card-theme-preview"
                  style={{
                    background: `linear-gradient(90deg, ${coach.theme?.rosado}, ${coach.theme?.morado}, ${coach.theme?.celeste})`,
                  }}
                />
                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary admin-btn-sm"
                    onClick={() => onManageStudents(coach)}
                  >
                    Alumnos
                  </button>
                  <button type="button" className="admin-btn-secondary admin-btn-sm" onClick={() => onEdit(coach)}>
                    Editar paleta
                  </button>
                  {pending && invite?.token && (
                    <button
                      type="button"
                      className="admin-btn-secondary admin-btn-sm"
                      onClick={() => copyInvite(invite.token, coach.id)}
                    >
                      {copied === coach.id ? "¡Copiado!" : "Copiar link invitación"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-danger admin-btn-sm"
                    disabled={deleting === coach.id}
                    onClick={() => handleDelete(coach)}
                  >
                    {deleting === coach.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
