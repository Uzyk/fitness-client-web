import ScreenHeader from "../components/ScreenHeader.jsx";
import { students, formatCLP } from "../data/mock.js";
import { PaymentBadge } from "../components/Badges.jsx";

function groupByStatus(list) {
  const review = list.filter((s) => s.paymentStatus === "review");
  const overdue = list.filter((s) => s.paymentStatus === "overdue");
  const pending = list.filter((s) => s.paymentStatus === "pending");
  const paid = list.filter((s) => s.paymentStatus === "paid");
  return { review, overdue, pending, paid };
}

function PaymentGroup({ title, items, onOpenStudent }) {
  if (items.length === 0) return null;
  return (
    <section className="coach-section">
      <h2 className="coach-section-label">
        {title} ({items.length})
      </h2>
      <div className="coach-group coach-glass">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            className="coach-row"
            onClick={() => onOpenStudent(s.id, s.paymentStatus === "review" ? "receipt" : undefined)}
          >
            <div className="coach-row-content">
              <div className="coach-row-title">{s.name}</div>
              <div className="coach-row-subtitle">{formatCLP(s.monthlyFee)} · Agosto 2026</div>
            </div>
            <PaymentBadge status={s.paymentStatus} />
            <span className="coach-chevron">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PaymentsScreen({ onOpenStudent }) {
  const { review, overdue, pending, paid } = groupByStatus(students);

  return (
    <div className="coach-screen">
      <ScreenHeader title="Pagos" subtitle="Agosto 2026" />

      <PaymentGroup title="Por revisar" items={review} onOpenStudent={onOpenStudent} />
      <PaymentGroup title="Atrasados" items={overdue} onOpenStudent={onOpenStudent} />
      <PaymentGroup title="Pendientes" items={pending} onOpenStudent={onOpenStudent} />
      <PaymentGroup title="Al día" items={paid} onOpenStudent={onOpenStudent} />
    </div>
  );
}
