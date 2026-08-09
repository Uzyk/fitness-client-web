import { useEffect, useState } from "react";
import { deleteStudent, fetchCoachStudents } from "../../lib/adminApi.js";
import { buildInviteUrl } from "../../lib/coachTheme.js";

const MODALITY_LABEL = {
  online: "Online",
  presencial: "Presencial",
  mixto: "Mixto",
};

function studentStatus(student) {
  if (student.has_account) return { key: "active", label: "Activo" };
  const inv = student.invitation;
  if (inv && !inv.accepted_at && inv.expires_at && new Date(inv.expires_at) > new Date()) {
    return { key: "invited", label: "Invitación pendiente" };
  }
  if (student.full_name === "Pendiente") {
    return { key: "invited", label: "Sin completar registro" };
  }
  return { key: "active", label: "Activo" };
}

export default function CoachStudents({ coach, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const coachLabel =
    coach.brand_name === "Pendiente" ? coach.email : coach.brand_name;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCoachStudents(coach.id);
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [coach.id]);

  const copyInvite = (token, id) => {
    navigator.clipboard.writeText(buildInviteUrl(token));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (student) => {
    const name = student.full_name === "Pendiente" ? student.email : student.full_name;
    const ok = window.confirm(
      `¿Eliminar al alumno "${name}"?\n\nSe borrará su acceso, invitaciones y datos de entrenamiento. Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setDeleting(student.id);
    try {
      await deleteStudent(student.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <button type="button" className="admin-back" onClick={onBack}>
        ← Coaches
      </button>

      <div className="admin-toolbar">
        <div>
          <h2 className="admin-section-title">Alumnos</h2>
          <p className="admin-muted">{coachLabel}</p>
        </div>
      </div>

      <p className="admin-support-note">
        Gestión de soporte: nombre, contacto y acceso. Sin información de precios ni pagos.
      </p>

      {loading && <p className="admin-muted">Cargando alumnos…</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && students.length === 0 && (
        <p className="admin-muted">Este coach no tiene alumnos registrados.</p>
      )}

      {!loading && students.length > 0 && (
        <div className="admin-list">
          {students.map((student) => {
            const status = studentStatus(student);
            const pendingInvite =
              status.key === "invited" &&
              student.invitation?.token &&
              !student.invitation.accepted_at;
            const displayName =
              student.full_name === "Pendiente" ? student.email : student.full_name;

            return (
              <div key={student.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>{displayName}</h3>
                    <p className="admin-muted">{student.email}</p>
                    <p className="admin-muted admin-student-meta">
                      {MODALITY_LABEL[student.modality] || student.modality}
                    </p>
                  </div>
                  <span className={`admin-badge admin-badge--${status.key}`}>
                    {status.label}
                  </span>
                </div>

                <div className="admin-card-actions">
                  {pendingInvite && (
                    <button
                      type="button"
                      className="admin-btn-secondary admin-btn-sm"
                      onClick={() => copyInvite(student.invitation.token, student.id)}
                    >
                      {copied === student.id ? "¡Copiado!" : "Copiar link invitación"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn-danger admin-btn-sm"
                    disabled={deleting === student.id}
                    onClick={() => handleDelete(student)}
                  >
                    {deleting === student.id ? "Eliminando…" : "Eliminar"}
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
