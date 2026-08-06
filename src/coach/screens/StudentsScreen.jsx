import { useMemo, useState } from "react";
import ScreenHeader from "../components/ScreenHeader.jsx";
import { students, formatCLP } from "../data/mock.js";
import { ModalityBadge, PaymentBadge, StudentAlerts } from "../components/Badges.jsx";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "presencial", label: "Presencial" },
  { id: "online", label: "Online" },
];

export default function StudentsScreen({ onOpenStudent }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchFilter = filter === "all" || s.modality === filter;
      const matchQuery = s.name.toLowerCase().includes(query.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [query, filter]);

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

      <button type="button" className="coach-btn-primary" style={{ marginTop: 20 }}>
        + Agregar alumno
      </button>
    </div>
  );
}
