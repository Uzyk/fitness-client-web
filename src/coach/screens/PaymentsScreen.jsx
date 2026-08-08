import { useState } from "react";
import ScreenHeader from "../components/ScreenHeader.jsx";
import PaymentReceiptSheet from "../components/PaymentReceiptSheet.jsx";
import { formatCLP, getMonthLabel } from "../data/studentData.js";
import { PaymentBadge } from "../components/Badges.jsx";
import { useCoach } from "../context/CoachContext.jsx";

function groupByStatus(list) {
  const review = list.filter((s) => s.paymentStatus === "review");
  const overdue = list.filter((s) => s.paymentStatus === "overdue");
  const pending = list.filter((s) => s.paymentStatus === "pending");
  const paid = list.filter((s) => s.paymentStatus === "paid");
  return { review, overdue, pending, paid };
}

function PaymentGroup({ title, items, onViewReceipt }) {
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
            onClick={() => onViewReceipt(s)}
          >
            <div className="coach-row-content">
              <div className="coach-row-title">{s.name}</div>
              <div className="coach-row-subtitle">{formatCLP(s.monthlyFee)} · {getMonthLabel()}</div>
            </div>
            <PaymentBadge status={s.paymentStatus} />
            <span className="coach-chevron">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PaymentsScreen() {
  const { students } = useCoach();
  const [receiptStudent, setReceiptStudent] = useState(null);
  const { review, overdue, pending, paid } = groupByStatus(students);

  return (
    <>
      <div className="coach-screen">
        <ScreenHeader title="Pagos" subtitle={getMonthLabel()} />

        <PaymentGroup title="Por revisar" items={review} onViewReceipt={setReceiptStudent} />
        <PaymentGroup title="Atrasados" items={overdue} onViewReceipt={setReceiptStudent} />
        <PaymentGroup title="Pendientes" items={pending} onViewReceipt={setReceiptStudent} />
        <PaymentGroup title="Al día" items={paid} onViewReceipt={setReceiptStudent} />
      </div>

      {receiptStudent && (
        <PaymentReceiptSheet
          student={receiptStudent}
          onClose={() => setReceiptStudent(null)}
        />
      )}
    </>
  );
}
