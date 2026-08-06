import { useState } from "react";
import NavBar from "../components/NavBar.jsx";
import { ModalityBadge, PaymentBadge } from "../components/Badges.jsx";
import { modalityDescription } from "../theme.js";
import { formatCLP } from "../data/mock.js";

function VideoReviewCard({ video, onPublish }) {
  const [feedback, setFeedback] = useState("");

  return (
    <div className="coach-video-card">
      <div className="coach-video-preview">
        <div className="coach-video-play" aria-hidden>
          ▶
        </div>
      </div>
      <div className="coach-video-body">
        <div className="coach-video-title">{video.exercise}</div>
        <div className="coach-video-meta">
          {video.routine} · Enviado {video.sentAt}
        </div>
        {video.note && (
          <div className="coach-video-meta" style={{ marginTop: 8, fontStyle: "italic" }}>
            Alumno: "{video.note}"
          </div>
        )}
        <textarea
          className="coach-feedback-input"
          placeholder="Escribe tu feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
        <button
          type="button"
          className="coach-btn-primary"
          disabled={!feedback.trim()}
          onClick={() => onPublish?.(video.id, feedback)}
        >
          Publicar feedback
        </button>
      </div>
    </div>
  );
}

function ResumenTab({ student, focusKind, onPublishVideo }) {
  const [correction, setCorrection] = useState("");

  return (
    <>
      {student.pendingVideos.length > 0 && (
        <section className="coach-section">
          <h2 className="coach-section-label">Pendiente de revisar</h2>
          {student.pendingVideos.map((video) => (
            <VideoReviewCard key={video.id} video={video} onPublish={onPublishVideo} />
          ))}
        </section>
      )}

      {student.modality === "presencial" && (
        <section className="coach-section">
          <h2 className="coach-section-label">Corrección presencial</h2>
          <div className="coach-group" style={{ padding: 16 }}>
            <textarea
              className="coach-feedback-input"
              placeholder="Ej: Bajar peso en press banca..."
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
              rows={3}
              style={{ marginTop: 0 }}
            />
            <button type="button" className="coach-btn-primary" disabled={!correction.trim()}>
              Guardar corrección
            </button>
          </div>
        </section>
      )}

      {student.recentFeedback.length > 0 && (
        <section className="coach-section">
          <h2 className="coach-section-label">Correcciones recientes</h2>
          <div className="coach-group">
            {student.recentFeedback.map((fb) => (
              <div key={fb.id} className="coach-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div className="coach-row-title">
                  {fb.date} · {fb.type === "online" ? "Online" : "Presencial"}
                  {fb.exercise ? ` · ${fb.exercise}` : ""}
                </div>
                <div className="coach-row-subtitle coach-row-subtitle--body" style={{ marginTop: 6 }}>
                  {fb.text}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {student.modality === "online" && (
        <section className="coach-section">
          <h2 className="coach-section-label">Modalidad online</h2>
          <div className="coach-group">
            <div className="coach-row">
              <div className="coach-row-content">
                <div className="coach-row-title">Corrección por video</div>
                <div className="coach-row-subtitle">{modalityDescription("online")}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {student.nextSession && student.modality !== "online" && (
        <section className="coach-section">
          <h2 className="coach-section-label">Próxima sesión</h2>
          <div className="coach-group">
            <div className="coach-row">
              <div className="coach-row-content">
                <div className="coach-row-title">
                  {student.nextSession.date} · {student.nextSession.time}
                </div>
                <div className="coach-row-subtitle">
                  Presencial · {student.nextSession.place || "Gimnasio"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {focusKind === "receipt" && student.paymentStatus === "review" && (
        <section className="coach-section">
          <h2 className="coach-section-label">Comprobante</h2>
          <div className="coach-group">
            <div className="coach-row">
              <div className="coach-row-content">
                <div className="coach-row-title">Comprobante recibido</div>
                <div className="coach-row-subtitle">{formatCLP(student.monthlyFee)} · Agosto 2026</div>
              </div>
            </div>
          </div>
          <button type="button" className="coach-btn-primary">
            Confirmar pago
          </button>
          <button type="button" className="coach-btn-secondary">
            Pedir otro comprobante
          </button>
        </section>
      )}
    </>
  );
}

function RutinaTab({ student }) {
  if (student.routine.length === 0) {
    return <p className="coach-empty">Sin rutina cargada.</p>;
  }

  const statusLabel = {
    pending: { text: "Video pendiente", class: "coach-badge--purple" },
    done: { text: "Feedback enviado", class: "coach-badge--green" },
    none: { text: "Sin video", class: "coach-badge--gray" },
  };

  return (
    <section className="coach-section">
      <div className="coach-group">
        {student.routine.map((ex) => {
          const st = statusLabel[ex.videoStatus] || statusLabel.none;
          return (
            <div key={ex.id} className="coach-row">
              <div className="coach-row-content">
                <div className="coach-row-title">{ex.name}</div>
                <div className="coach-row-subtitle">{ex.detail}</div>
              </div>
              <span className={`coach-badge ${st.class}`}>{st.text}</span>
            </div>
          );
        })}
      </div>
      <button type="button" className="coach-btn-secondary">
        Editar rutina
      </button>
    </section>
  );
}

function PagosTab({ student }) {
  return (
    <section className="coach-section">
      <div className="coach-group">
        {student.payments.map((p, i) => (
          <div key={i} className="coach-row">
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
      {student.paymentStatus !== "paid" && (
        <>
          <button type="button" className="coach-btn-primary">
            Marcar como pagado
          </button>
          <button type="button" className="coach-btn-secondary">
            Enviar recordatorio
          </button>
        </>
      )}
    </section>
  );
}

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "rutina", label: "Rutina" },
  { id: "pagos", label: "Pagos" },
];

export default function StudentDetailScreen({ student, focusKind, onBack }) {
  const initialTab =
    focusKind === "receipt" ? "pagos" : focusKind === "videos" ? "resumen" : "resumen";
  const [tab, setTab] = useState(initialTab);

  const handlePublishVideo = (videoId, feedback) => {
    alert(`Feedback publicado para video ${videoId}:\n${feedback}`);
  };

  return (
    <>
      <NavBar title={student.name} onBack={onBack} />
      <div className="coach-screen" style={{ paddingTop: 0 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <ModalityBadge modality={student.modality} />
          <PaymentBadge status={student.paymentStatus} />
        </div>

        <div className="coach-segmented">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`coach-segment${tab === t.id ? " coach-segment--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "resumen" && (
          <ResumenTab student={student} focusKind={focusKind} onPublishVideo={handlePublishVideo} />
        )}
        {tab === "rutina" && <RutinaTab student={student} />}
        {tab === "pagos" && <PagosTab student={student} />}
      </div>
    </>
  );
}
