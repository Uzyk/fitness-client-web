/** Radios con separación uniforme entre anillos (Δ = 12) */
const RINGS = [
  { key: "paid", radius: 46, stroke: 9, track: "var(--ring-track)" },
  { key: "pending", radius: 34, stroke: 9, track: "var(--ring-track)" },
  { key: "overdue", radius: 22, stroke: 9, track: "var(--ring-track)" },
];

const COLORS = {
  paid: "var(--ring-paid)",
  pending: "var(--ring-pending)",
  overdue: "var(--ring-overdue)",
};

function RingArc({ radius, stroke, progress, color, delay }) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);

  return (
    <>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--ring-track)"
        strokeWidth={stroke}
        opacity={0.35}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        className="coach-ring-arc"
        style={{
          "--ring-circ": circumference,
          "--ring-offset": offset,
          animationDelay: `${delay}ms`,
        }}
      />
    </>
  );
}

export default function ActivityRings({ paid, pending, overdue, total }) {
  const max = Math.max(total, 1);
  const progress = {
    paid: paid / max,
    pending: pending / max,
    overdue: overdue / max,
  };

  return (
    <div className="coach-rings-wrap">
      <svg viewBox="0 0 100 100" className="coach-rings-svg" aria-hidden>
        {RINGS.map((ring, i) => (
          <RingArc
            key={ring.key}
            radius={ring.radius}
            stroke={ring.stroke}
            progress={progress[ring.key]}
            color={COLORS[ring.key]}
            delay={i * 120}
          />
        ))}
      </svg>
      <div className="coach-rings-center">
        <span className="coach-rings-center-value">{total}</span>
        <span className="coach-rings-center-label">alumnos</span>
      </div>
    </div>
  );
}

export function RingLegend({ paid, pending, overdue }) {
  const items = [
    { key: "paid", label: "Pagados", value: paid, color: "var(--ring-paid)" },
    { key: "pending", label: "Pendientes", value: pending, color: "var(--ring-pending)" },
    { key: "overdue", label: "Atrasados", value: overdue, color: "var(--ring-overdue)" },
  ];

  return (
    <div className="coach-ring-legend">
      {items.map((item) => (
        <div key={item.key} className="coach-ring-legend-item">
          <span className="coach-ring-legend-dot" style={{ background: item.color }} />
          <span className="coach-ring-legend-value">{item.value}</span>
          <span className="coach-ring-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
