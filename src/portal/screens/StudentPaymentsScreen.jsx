import ScreenHeader from "../../coach/components/ScreenHeader.jsx";
import { PaymentBadge } from "../../coach/components/Badges.jsx";
import { formatCLP, getMonthLabel, getStudentReceipt } from "../../coach/data/studentData.js";
import { paymentStatusLabel } from "../../coach/theme.js";

function isPdfUrl(url) {
  return /\.pdf(\?|$)/i.test(url);
}

export default function StudentPaymentsScreen({
  student,
  onLogout,
  needsReceipt,
  uploadingReceipt,
  onReceiptUpload,
}) {
  const receipt = getStudentReceipt(student);
  const currentPayment =
    student.payments?.find((p) => p.status !== "paid") ||
    student.payments?.[student.payments.length - 1];

  return (
    <div className="coach-screen coach-screen--payments">
      <ScreenHeader
        studioName={student.coach?.brand_name || "Studio Fit"}
        title="Pagos"
        subtitle={`${getMonthLabel()} · ${formatCLP(student.monthlyFee)}/mes`}
        onLogout={onLogout}
      />

      <section className="coach-section coach-animate-in">
        <h2 className="coach-section-label">Estado del mes</h2>
        <div className="coach-group coach-glass">
          <div className="coach-row coach-row--stacked">
            <div className="coach-row-content">
              <div className="coach-row-title">{formatCLP(student.monthlyFee)}</div>
              <div className="coach-row-subtitle">
                {student.paymentStatus === "paid" && "Mensualidad al día"}
                {student.paymentStatus === "pending" && "Pendiente — sube tu comprobante de transferencia"}
                {student.paymentStatus === "overdue" && "Atrasado — regulariza cuando puedas"}
                {student.paymentStatus === "review" && "Comprobante enviado — tu coach lo revisará pronto"}
              </div>
            </div>
            <PaymentBadge status={student.paymentStatus} />
          </div>
        </div>

        {needsReceipt && (
          <div className="coach-payment-upload" style={{ marginTop: 12 }}>
            <p className="coach-subtitle" style={{ marginBottom: 12 }}>
              Transfiere {formatCLP(student.monthlyFee)} y sube el comprobante para que tu coach confirme
              el pago.
            </p>
            <label className="coach-btn-primary">
              {uploadingReceipt ? "Subiendo…" : "Subir comprobante"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                hidden
                disabled={uploadingReceipt}
                onChange={onReceiptUpload}
              />
            </label>
          </div>
        )}

        {student.paymentStatus === "review" && receipt?.receiptUrl && (
          <div className="coach-payment-upload" style={{ marginTop: 12 }}>
            <p className="coach-field-label">Comprobante enviado</p>
            {isPdfUrl(receipt.receiptUrl) ? (
              <a
                href={receipt.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="coach-btn-secondary"
              >
                Ver comprobante (PDF)
              </a>
            ) : (
              <a
                href={receipt.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="coach-receipt-preview"
              >
                <img src={receipt.receiptUrl} alt="Comprobante subido" />
              </a>
            )}
            {receipt.submittedAt && (
              <p className="coach-field-hint">Subido {receipt.submittedAt}</p>
            )}
          </div>
        )}

        {student.paymentStatus === "paid" && (
          <p className="coach-field-hint" style={{ marginTop: 12 }}>
            No necesitas subir comprobante este mes. Tu coach ya confirmó el pago.
          </p>
        )}
      </section>

      {student.payments?.length > 0 && (
        <section className="coach-section coach-animate-in" style={{ animationDelay: "60ms" }}>
          <h2 className="coach-section-label">Historial</h2>
          <div className="coach-group coach-glass">
            {[...student.payments].reverse().map((p, i) => (
              <div key={`${p.month}-${i}`} className="coach-row">
                <div className="coach-row-content">
                  <div className="coach-row-title">{p.month}</div>
                  <div className="coach-row-subtitle">
                    {formatCLP(p.amount)}
                    {p.confirmedAt ? ` · Confirmado ${p.confirmedAt}` : ""}
                    {p.submittedAt ? ` · Subido ${p.submittedAt}` : ""}
                  </div>
                </div>
                <PaymentBadge status={p.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="coach-field-hint" style={{ marginTop: 8, padding: "0 4px" }}>
        Estado actual: {paymentStatusLabel(student.paymentStatus)}.
        {currentPayment?.month ? ` Mes: ${currentPayment.month}.` : ""}
      </p>
    </div>
  );
}
