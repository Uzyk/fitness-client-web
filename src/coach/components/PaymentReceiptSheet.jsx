import { useEffect, useState } from "react";
import { formatCLP, getStudentReceipt } from "../data/studentData.js";
import { PaymentBadge } from "./Badges.jsx";
import { useCoach } from "../context/CoachContext.jsx";

function isPdfUrl(url) {
  return /\.pdf(\?|$)/i.test(url);
}

export default function PaymentReceiptSheet({ student, onClose }) {
  const { markPaid, askReceipt } = useCoach();
  const [busy, setBusy] = useState(false);
  const receipt = student ? getStudentReceipt(student) : null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!student) return null;

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="coach-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="coach-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coach-sheet-handle" aria-hidden />
        <header className="coach-sheet-header">
          <div>
            <h2 id="receipt-sheet-title" className="coach-sheet-title">
              {student.name}
            </h2>
            <p className="coach-sheet-subtitle">
              {receipt?.month || "Pago mensual"} · {formatCLP(receipt?.amount ?? student.monthlyFee)}
            </p>
          </div>
          <PaymentBadge status={student.paymentStatus} />
        </header>

        <div className="coach-sheet-body">
          {receipt?.receiptUrl ? (
            isPdfUrl(receipt.receiptUrl) ? (
              <div className="coach-receipt-preview coach-receipt-preview--pdf">
                <p>Comprobante en PDF</p>
                <a
                  href={receipt.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="coach-btn-secondary"
                >
                  Abrir comprobante
                </a>
              </div>
            ) : (
              <a
                href={receipt.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="coach-receipt-preview"
              >
                <img src={receipt.receiptUrl} alt="Comprobante de transferencia" />
              </a>
            )
          ) : (
            <div className="coach-receipt-empty">
              <p>
                {student.paymentStatus === "review"
                  ? "Marca por revisar, pero aún no hay archivo adjunto."
                  : "El alumno aún no ha subido un comprobante."}
              </p>
            </div>
          )}
          {receipt?.submittedAt && (
            <p className="coach-field-hint">Subido {receipt.submittedAt}</p>
          )}
        </div>

        {student.paymentStatus === "review" && (
          <div className="coach-sheet-actions">
            <button
              type="button"
              className="coach-btn-primary"
              disabled={busy}
              onClick={() => run(() => markPaid(student.id))}
            >
              {busy ? "Confirmando…" : "Confirmar pago"}
            </button>
            <button
              type="button"
              className="coach-btn-secondary"
              disabled={busy}
              onClick={() => run(() => askReceipt(student.id))}
            >
              Pedir otro comprobante
            </button>
          </div>
        )}

        <button type="button" className="coach-sheet-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
