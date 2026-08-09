import { useMemo, useState } from "react";
import ScreenHeader from "../components/ScreenHeader.jsx";
import { formatCLP } from "../data/studentData.js";
import { ModalityBadge, PaymentBadge, StudentAlerts } from "../components/Badges.jsx";
import { useCoach } from "../context/CoachContext.jsx";
import { buildInviteUrl } from "../../lib/coachTheme.js";
import { modalityDescription } from "../theme.js";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "presencial", label: "Presencial" },
  { id: "online", label: "Online" },
];

export default function StudentsScreen({ onOpenStudent }) {
  const { students, addStudent } = useCoach();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [modality, setModality] = useState("online");
  const [fee, setFee] = useState("70000");
  const [saving, setSaving] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchFilter = filter === "all" || s.modality === filter;
      const q = query.toLowerCase();
      const matchQuery =
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [students, query, filter]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      const result = await addStudent({
        email: email.trim(),
        modality,
        monthlyFee: Number(fee) || 70000,
      });
      if (result?.token) {
        setInviteUrl(buildInviteUrl(result.token));
      }
      setEmail("");
      setShowForm(false);
    } catch {
      // toast handled in CoachContext
    } finally {
      setSaving(false);
    }
  };

  const copyInvite = (token, id) => {
    navigator.clipboard.writeText(buildInviteUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (inviteUrl) {
    return (
      <div className="coach-screen">
        <ScreenHeader title="Invitación lista" subtitle="Comparte el link con tu alumno" />
        <div className="coach-group coach-glass" style={{ padding: 16 }}>
          <p className="coach-subtitle" style={{ marginBottom: 12 }}>
            El alumno completará su nombre y contraseña. Modalidad y cuota ya quedaron definidas
            por ti.
          </p>
          <div className="coach-invite-box">
            <code>{inviteUrl}</code>
          </div>
          <button
            type="button"
            className="coach-btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
          >
            Copiar link
          </button>
          <button
            type="button"
            className="coach-btn-secondary"
            style={{ marginTop: 8 }}
            onClick={() => setInviteUrl("")}
          >
            Volver a alumnos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-screen">
      <ScreenHeader title="Alumnos" subtitle="Lista y filtros" />

      <div className="coach-search coach-glass">
        <span aria-hidden>🔍</span>
        <input
          type="search"
          placeholder="Buscar alumno"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar alumno"
        />
      </div>

      <div className="coach-segmented">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`coach-segment${filter === f.id ? " coach-segment--active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="coach-group coach-glass">
        {filtered.map((student) => (
          <div key={student.id} className="coach-row coach-row--with-action">
            <button
              type="button"
              className="coach-row-main"
              onClick={() => student.hasAccount && onOpenStudent(student.id)}
              disabled={!student.hasAccount}
            >
              <div className="coach-row-content">
                <div className="coach-row-title">{student.name}</div>
                <div className="coach-row-subtitle">
                  {student.hasAccount
                    ? `${formatCLP(student.monthlyFee)}/mes`
                    : "Invitación pendiente · sin cuenta"}
                </div>
                {student.hasAccount && <StudentAlerts alerts={student.alerts} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <ModalityBadge modality={student.modality} />
                {student.hasAccount ? (
                  <PaymentBadge status={student.paymentStatus} />
                ) : (
                  <span className="coach-badge coach-badge--purple">Invitado</span>
                )}
              </div>
              {student.hasAccount && <span className="coach-chevron">›</span>}
            </button>
            {!student.hasAccount && student.inviteToken && (
              <button
                type="button"
                className="coach-btn-secondary coach-btn-sm coach-row-copy"
                onClick={() => copyInvite(student.inviteToken, student.id)}
              >
                {copiedId === student.id ? "¡Copiado!" : "Copiar link"}
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="coach-empty">No hay alumnos con ese filtro.</p>
      )}

      {showForm ? (
        <form className="coach-inline-form coach-glass" onSubmit={handleInvite} style={{ marginTop: 20 }}>
          <h3 className="coach-section-label">Invitar alumno</h3>
          <input
            type="email"
            placeholder="Email del alumno"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
            <option value="mixto">Mixto</option>
          </select>
          <p className="coach-routine-hint">{modalityDescription(modality)}</p>
          <input
            type="number"
            placeholder="Cuota mensual (CLP)"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            min={0}
            step={1000}
          />
          <div className="coach-inline-actions">
            <button type="submit" className="coach-btn-primary" disabled={saving}>
              {saving ? "Generando…" : "Generar link de invitación"}
            </button>
            <button type="button" className="coach-btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="coach-btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => setShowForm(true)}
        >
          + Invitar alumno
        </button>
      )}
    </div>
  );
}
