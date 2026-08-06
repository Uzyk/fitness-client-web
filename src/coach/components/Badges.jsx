import { modalityLabel, paymentStatusLabel } from "../theme.js";

const paymentBadgeClass = {
  paid: "coach-badge--green",
  pending: "coach-badge--orange",
  overdue: "coach-badge--red",
  review: "coach-badge--purple",
};

export function PaymentBadge({ status }) {
  return (
    <span className={`coach-badge ${paymentBadgeClass[status] || "coach-badge--gray"}`}>
      {paymentStatusLabel(status)}
    </span>
  );
}

export function ModalityBadge({ modality }) {
  const isOnline = modality === "online";
  return (
    <span className={`coach-badge ${isOnline ? "coach-badge--sky" : "coach-badge--gray"}`}>
      {modalityLabel(modality)}
    </span>
  );
}

export function StudentAlerts({ alerts }) {
  const parts = [];
  if (alerts.videos > 0) parts.push(`${alerts.videos} video${alerts.videos > 1 ? "s" : ""}`);
  if (alerts.receipt > 0) parts.push("Comprobante");
  if (parts.length === 0) return null;
  return (
    <span className="coach-row-subtitle coach-row-subtitle--accent">
      {parts.join(" · ")}
    </span>
  );
}
