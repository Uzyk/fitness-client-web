import { useMemo, useState } from "react";
import ScreenHeader from "../components/ScreenHeader.jsx";
import { formatCLP } from "../data/studentData.js";
import { ModalityBadge, PaymentBadge, StudentAlerts } from "../components/Badges.jsx";
import { useCoach } from "../context/CoachContext.jsx";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [modality, setModality] = useState("online");
  const [fee, setFee] = useState("70000");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchFilter = filter === "all" || s.modality === filter;
      const matchQuery = s.name.toLowerCase().includes(query.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [students, query, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await addStudent({
        fullName: name.trim(),
        email: email.trim(),
        modality,
        monthlyFee: Number(fee) || 70000,
      });
      setName("");
      setEmail("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

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
          <button
            key={student.id}
            type="button"
            className="coach-row"
            onClick={() => onOpenStudent(student.id)}
          >
            <div className="coach-row-content">
              <div className="coach-row-title">{student.name}</div>
              <div className="coach-row-subtitle">
                {formatCLP(student.monthlyFee)}/mes
              </div>
              <StudentAlerts alerts={student.alerts} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <ModalityBadge modality={student.modality} />
              <PaymentBadge status={student.paymentStatus} />
            </div>
            <span className="coach-chevron">›</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="coach-empty">No hay alumnos con ese filtro.</p>
      )}

      {showForm ? (
        <form className="coach-inline-form coach-glass" onSubmit={handleAdd} style={{ marginTop: 20 }}>
          <h3 className="coach-section-label">Nuevo alumno</h3>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={modality} onChange={(e) => setModality(e.target.value)}>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
            <option value="mixto">Mixto</option>
          </select>
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
              {saving ? "Guardando…" : "Guardar alumno"}
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
          + Agregar alumno
        </button>
      )}
    </div>
  );
}
