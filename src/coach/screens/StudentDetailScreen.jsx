import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar.jsx";
import PaymentReceiptSheet from "../components/PaymentReceiptSheet.jsx";
import { ModalityBadge, PaymentBadge } from "../components/Badges.jsx";
import { modalityDescription, modalityLabel, paymentStatusLabel } from "../theme.js";
import { formatCLP } from "../data/studentData.js";
import {
  formatExerciseDisplay,
  normalizeRoutine,
  PRESCRIPTION_DEFAULTS,
} from "../data/exercisePrescription.js";
import {
  createRoutinePlan,
  ensureStudentRoutines,
  getRoutineForDate,
} from "../data/routinePlans.js";
import { useCoach } from "../context/CoachContext.jsx";
import { toDateKey } from "../utils/calendar.js";
import {
  getGeneralFeedback,
  indexFeedbackByExercise,
} from "../../lib/feedbackByExercise.js";

function VideoReviewCard({ video, onPublish }) {
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePublish = async () => {
    if (!feedback.trim() || !onPublish) return;
    setSaving(true);
    try {
      await onPublish(video.id, feedback.trim(), video.exercise);
      setFeedback("");
    } finally {
      setSaving(false);
    }
  };

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
          disabled={!feedback.trim() || saving}
          onClick={handlePublish}
        >
          {saving ? "Publicando…" : "Publicar feedback"}
        </button>
      </div>
    </div>
  );
}

function ExerciseCommentCard({ exercise, feedbackList, isOnline, onSubmitComment, studentId }) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim() || !onSubmitComment) return;
    setSaving(true);
    try {
      await onSubmitComment(studentId, comment.trim(), exercise.name);
      setComment("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coach-exercise-comment coach-glass">
      <div className="coach-exercise-comment-header">
        <div>
          <div className="coach-row-title">{exercise.name}</div>
          <div className="coach-row-subtitle">{formatExerciseDisplay(exercise)}</div>
        </div>
      </div>

      {feedbackList.length > 0 && (
        <div className="coach-exercise-comment-history">
          {feedbackList.slice(0, 3).map((fb) => (
            <div key={fb.id} className="coach-exercise-comment-item">
              <p
                className={`coach-feedback-date ${
                  isOnline ? "coach-feedback-date--online" : "coach-feedback-date--presencial"
                }`}
              >
                {fb.date}
              </p>
              <p className="coach-feedback-text">{fb.text}</p>
            </div>
          ))}
        </div>
      )}

      <textarea
        className="coach-feedback-input"
        placeholder={`Comentario sobre ${exercise.name}…`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        style={{ marginTop: feedbackList.length ? 10 : 0 }}
      />
      <button
        type="button"
        className="coach-btn-primary coach-btn-sm"
        disabled={!comment.trim() || saving}
        onClick={handleSubmit}
        style={{ marginTop: 8 }}
      >
        {saving ? "Enviando…" : "Enviar comentario"}
      </button>
    </div>
  );
}

function ResumenTab({ student, focusKind, onPublishVideo, onSubmitComment, onConfirmPayment, onRequestReceipt }) {
  const { schedule } = useCoach();
  const [paymentBusy, setPaymentBusy] = useState(false);
  const isOnline = student.modality === "online";
  const todayKey = toDateKey(new Date());
  const studentSchedule = useMemo(
    () => schedule.filter((row) => row.student_id === student.id),
    [schedule, student.id],
  );
  const todayPlan = useMemo(
    () =>
      getRoutineForDate(
        {
          id: student.id,
          routines: student.routines,
          activeRoutineId: student.activeRoutineId,
        },
        studentSchedule,
        todayKey,
      ),
    [student, studentSchedule, todayKey],
  );
  const feedbackByExercise = useMemo(
    () => indexFeedbackByExercise(student.recentFeedback),
    [student.recentFeedback],
  );
  const generalFeedback = useMemo(
    () => getGeneralFeedback(student.recentFeedback),
    [student.recentFeedback],
  );
  const commentExercises = todayPlan?.exercises?.length
    ? todayPlan.exercises
    : student.routine?.length
      ? student.routine
      : Array.from(feedbackByExercise.keys()).map((name) => ({ id: name, name }));

  const handlePaymentAction = async (action) => {
    setPaymentBusy(true);
    try {
      await action();
    } finally {
      setPaymentBusy(false);
    }
  };

  return (
    <>
      {isOnline && student.pendingVideos.length > 0 && (
        <section className="coach-section">
          <h2 className="coach-section-label">Pendiente de revisar</h2>
          {student.pendingVideos.map((video) => (
            <VideoReviewCard key={video.id} video={video} onPublish={onPublishVideo} />
          ))}
        </section>
      )}

      {commentExercises.length > 0 && (
        <section className="coach-section">
          <h2 className="coach-section-label">Comentarios por ejercicio</h2>
          <p className="coach-subtitle" style={{ marginTop: -4, marginBottom: 12 }}>
            {todayPlan?.name
              ? `Rutina de hoy en calendario: ${todayPlan.name}`
              : "Feedback vinculado a cada movimiento"}
          </p>
          <div className="coach-exercise-comment-list">
            {commentExercises.map((exercise) => (
              <ExerciseCommentCard
                key={exercise.id || exercise.name}
                exercise={exercise}
                feedbackList={feedbackByExercise.get(exercise.name) || []}
                isOnline={isOnline}
                onSubmitComment={onSubmitComment}
                studentId={student.id}
              />
            ))}
          </div>
        </section>
      )}

      {generalFeedback.length > 0 && (
        <section className="coach-section">
          <h2 className="coach-section-label">Comentarios generales</h2>
          <div className="coach-group">
            {generalFeedback.map((fb) => (
              <div key={fb.id} className="coach-feedback-item">
                <p
                  className={`coach-feedback-date ${
                    isOnline ? "coach-feedback-date--online" : "coach-feedback-date--presencial"
                  }`}
                >
                  {fb.date}
                </p>
                <p className="coach-feedback-text">{fb.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isOnline && (
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
          <button
            type="button"
            className="coach-btn-primary"
            disabled={paymentBusy}
            onClick={() => handlePaymentAction(onConfirmPayment)}
          >
            {paymentBusy ? "Confirmando…" : "Confirmar pago"}
          </button>
          <button
            type="button"
            className="coach-btn-secondary"
            disabled={paymentBusy}
            onClick={() => handlePaymentAction(onRequestReceipt)}
          >
            Pedir otro comprobante
          </button>
        </section>
      )}
    </>
  );
}

function PrescriptionFields({ sets, reps, weightKg, onChange, idPrefix = "rx" }) {
  return (
    <div className="coach-prescription-row">
      <label className="coach-prescription-field">
        <span className="coach-prescription-label">Series</span>
        <input
          id={`${idPrefix}-sets`}
          type="number"
          min={1}
          max={20}
          inputMode="numeric"
          value={sets}
          onChange={(e) => onChange({ sets: e.target.value, reps, weightKg })}
        />
      </label>
      <label className="coach-prescription-field">
        <span className="coach-prescription-label">Reps</span>
        <input
          id={`${idPrefix}-reps`}
          type="number"
          min={1}
          max={100}
          inputMode="numeric"
          value={reps}
          onChange={(e) => onChange({ sets, reps: e.target.value, weightKg })}
        />
      </label>
      <label className="coach-prescription-field coach-prescription-field--weight">
        <span className="coach-prescription-label">Peso (kg)</span>
        <input
          id={`${idPrefix}-weight`}
          type="number"
          min={0}
          step={0.5}
          inputMode="decimal"
          placeholder="Opc."
          value={weightKg}
          onChange={(e) => onChange({ sets, reps, weightKg: e.target.value })}
        />
      </label>
    </div>
  );
}

function RutinaTab({ student, onSaveRoutines }) {
  const initial = ensureStudentRoutines(student);
  const [editing, setEditing] = useState(false);
  const [draftPlans, setDraftPlans] = useState(initial.routines);
  const [selectedId, setSelectedId] = useState(initial.activeRoutineId || initial.routines[0]?.id || null);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newSets, setNewSets] = useState(String(PRESCRIPTION_DEFAULTS.sets));
  const [newReps, setNewReps] = useState(String(PRESCRIPTION_DEFAULTS.reps));
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const saved = ensureStudentRoutines(student);
  const selectedPlan = (editing ? draftPlans : saved.routines).find((plan) => plan.id === selectedId)
    || (editing ? draftPlans : saved.routines)[0]
    || null;
  const isViewingActive = selectedPlan?.id === saved.activeRoutineId;

  useEffect(() => {
    if (!editing && saved.activeRoutineId) {
      setSelectedId(saved.activeRoutineId);
    }
  }, [student.id, saved.activeRoutineId, editing]);

  const startEditing = () => {
    const next = ensureStudentRoutines(student);
    setDraftPlans(next.routines);
    setSelectedId(next.activeRoutineId || next.routines[0]?.id || null);
    setEditing(true);
  };

  const startNewRoutine = () => {
    const plan = createRoutinePlan("Nueva rutina");
    setDraftPlans((prev) => [...prev, plan]);
    setSelectedId(plan.id);
    setEditing(true);
  };

  if (saved.routines.length === 0 && !editing) {
    return (
      <>
        <p className="coach-empty">Sin rutinas cargadas.</p>
        <button type="button" className="coach-btn-secondary" onClick={startNewRoutine}>
          Crear rutina
        </button>
      </>
    );
  }

  const showVideoStatus = student.modality === "online";
  const statusLabel = {
    pending: { text: "Video pendiente", class: "coach-badge--purple" },
    done: { text: "Feedback enviado", class: "coach-badge--green" },
    none: { text: "Sin video", class: "coach-badge--gray" },
  };

  const updatePlans = (updater) => {
    setDraftPlans((prev) => updater(prev));
  };

  const updateSelectedPlan = (patch) => {
    if (!selectedPlan) return;
    updatePlans((prev) =>
      prev.map((plan) => (plan.id === selectedPlan.id ? { ...plan, ...patch } : plan)),
    );
  };

  const handleSave = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const normalized = draftPlans.map((plan) => ({
        ...plan,
        exercises: normalizeRoutine(plan.exercises || []),
      }));
      await onSaveRoutines(normalized, selectedId || normalized[0]?.id);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    if (!selectedPlan || !newExerciseName.trim()) return;
    updateSelectedPlan({
      exercises: normalizeRoutine([
        ...(selectedPlan.exercises || []),
        {
          id: `ex-${Date.now()}`,
          name: newExerciseName.trim(),
          sets: Number(newSets) || PRESCRIPTION_DEFAULTS.sets,
          reps: Number(newReps) || PRESCRIPTION_DEFAULTS.reps,
          weightKg: newWeight === "" ? undefined : Number(newWeight),
          videoStatus: student.modality === "online" ? "none" : undefined,
        },
      ]),
    });
    setNewExerciseName("");
    setNewSets(String(PRESCRIPTION_DEFAULTS.sets));
    setNewReps(String(PRESCRIPTION_DEFAULTS.reps));
    setNewWeight("");
  };

  const updateExercise = (exerciseId, patch) => {
    if (!selectedPlan) return;
    updateSelectedPlan({
      exercises: (selectedPlan.exercises || []).map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const next = { ...ex, ...patch };
        if (patch.sets != null) next.sets = Number(patch.sets) || PRESCRIPTION_DEFAULTS.sets;
        if (patch.reps != null) next.reps = Number(patch.reps) || PRESCRIPTION_DEFAULTS.reps;
        if (patch.weightKg != null) {
          next.weightKg = patch.weightKg === "" ? undefined : Number(patch.weightKg);
        }
        return normalizeRoutine([next])[0];
      }),
    });
  };

  const removeExercise = (exerciseId) => {
    if (!selectedPlan) return;
    updateSelectedPlan({
      exercises: (selectedPlan.exercises || []).filter((ex) => ex.id !== exerciseId),
    });
  };

  const removeRoutine = () => {
    if (draftPlans.length <= 1) return;
    const next = draftPlans.filter((plan) => plan.id !== selectedId);
    setDraftPlans(next);
    setSelectedId(next[0]?.id || null);
  };

  const exercises = normalizeRoutine(selectedPlan?.exercises || []);
  const plans = editing ? draftPlans : saved.routines;

  return (
    <section className="coach-section">
      <div className="coach-routine-header">
        {editing ? (
          <>
            <select
              className="coach-field"
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Seleccionar rutina"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="coach-field"
              value={selectedPlan?.name || ""}
              onChange={(e) => updateSelectedPlan({ name: e.target.value })}
              placeholder="Nombre de la rutina (ej. Pierna A)"
              aria-label="Nombre de la rutina"
            />
          </>
        ) : (
          <>
            {selectedPlan && (
              <div className="coach-routine-title-row">
                <h2 className="coach-routine-title">{selectedPlan.name}</h2>
                {isViewingActive && <span className="coach-routine-badge">Activa</span>}
              </div>
            )}
            <select
              className="coach-field"
              value={selectedId || saved.activeRoutineId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
              aria-label="Ver rutina"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                  {plan.id === saved.activeRoutineId ? " · activa" : ""}
                </option>
              ))}
            </select>
            <p className="coach-routine-hint">
              La rutina <strong>activa</strong> ({saved.routines.find((p) => p.id === saved.activeRoutineId)?.name || "—"}) es la que ve el alumno cuando no hay sesión agendada.
              Al agendar en Calendario puedes asignar otra rutina para ese día.
            </p>
          </>
        )}
      </div>

      {exercises.length === 0 && !editing ? (
        <p className="coach-empty">Esta rutina no tiene ejercicios.</p>
      ) : (
        <div className="coach-group">
          {exercises.map((ex) => {
            const st = statusLabel[ex.videoStatus] || statusLabel.none;
            return (
              <div key={ex.id} className={`coach-row${editing ? " coach-row--stacked" : ""}`}>
                {editing ? (
                  <div className="coach-routine-edit">
                    <input
                      type="text"
                      className="coach-field"
                      value={ex.name}
                      onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                      aria-label="Nombre del ejercicio"
                    />
                    <PrescriptionFields
                      idPrefix={`ex-${ex.id}`}
                      sets={String(ex.sets ?? PRESCRIPTION_DEFAULTS.sets)}
                      reps={String(ex.reps ?? PRESCRIPTION_DEFAULTS.reps)}
                      weightKg={ex.weightKg != null ? String(ex.weightKg) : ""}
                      onChange={(rx) => updateExercise(ex.id, rx)}
                    />
                    <p className="coach-prescription-preview">{formatExerciseDisplay(ex)}</p>
                  </div>
                ) : (
                  <div className="coach-row-content">
                    <div className="coach-row-title">{ex.name}</div>
                    <div className="coach-row-subtitle">{formatExerciseDisplay(ex)}</div>
                  </div>
                )}
                {showVideoStatus && !editing && selectedId === saved.activeRoutineId && (
                  <span className={`coach-badge ${st.class}`}>{st.text}</span>
                )}
                {editing && (
                  <button
                    type="button"
                    className="coach-btn-ghost coach-btn-sm"
                    onClick={() => removeExercise(ex.id)}
                    aria-label={`Eliminar ${ex.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <>
          <div className="coach-inline-form">
            <h3 className="coach-section-label">Añadir ejercicio</h3>
            <input
              type="text"
              placeholder="Nombre del ejercicio"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
            />
            <PrescriptionFields
              idPrefix="new-exercise"
              sets={newSets}
              reps={newReps}
              weightKg={newWeight}
              onChange={({ sets, reps, weightKg }) => {
                setNewSets(sets);
                setNewReps(reps);
                setNewWeight(weightKg);
              }}
            />
            <button type="button" className="coach-btn-secondary" onClick={addExercise}>
              + Añadir ejercicio
            </button>
          </div>
          <div className="coach-inline-actions" style={{ marginTop: 8 }}>
            <button type="button" className="coach-btn-secondary" onClick={startNewRoutine}>
              + Nueva rutina
            </button>
            {draftPlans.length > 1 && (
              <button type="button" className="coach-btn-secondary" onClick={removeRoutine}>
                Eliminar rutina
              </button>
            )}
          </div>
        </>
      )}

      {!editing ? (
        <button type="button" className="coach-btn-secondary" onClick={startEditing}>
          Editar rutinas
        </button>
      ) : (
        <div className="coach-inline-actions">
          <button type="button" className="coach-btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar rutinas"}
          </button>
          <button type="button" className="coach-btn-secondary" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </div>
      )}
    </section>
  );
}

function PagosTab({ student, onMarkPaid, onSendReminder, onRequestReceipt }) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const pendingReview = student.payments.find((p) => p.status === "review");

  return (
    <>
      <section className="coach-section">
        {pendingReview && (
          <div className="coach-group coach-glass" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="coach-row coach-row--interactive"
              onClick={() => setSelectedPayment(pendingReview)}
            >
              <div className="coach-row-content">
                <div className="coach-row-title">Comprobante por revisar</div>
                <div className="coach-row-subtitle">
                  {pendingReview.month} · {formatCLP(pendingReview.amount)}
                  {pendingReview.submittedAt ? ` · Subido ${pendingReview.submittedAt}` : ""}
                </div>
              </div>
              <PaymentBadge status="review" />
              <span className="coach-chevron">›</span>
            </button>
          </div>
        )}

        <h2 className="coach-section-label">Historial de pagos</h2>
        <div className="coach-group">
          {student.payments.map((p, i) => (
            <button
              key={i}
              type="button"
              className="coach-row coach-row--interactive"
              onClick={() => setSelectedPayment(p)}
            >
              <div className="coach-row-content">
                <div className="coach-row-title">{p.month}</div>
                <div className="coach-row-subtitle">
                  {formatCLP(p.amount)}
                  {p.confirmedAt ? ` · Confirmado ${p.confirmedAt}` : ""}
                  {p.submittedAt ? ` · Subido ${p.submittedAt}` : ""}
                  {p.receiptUrl ? " · Comprobante disponible" : ""}
                </div>
              </div>
              <PaymentBadge status={p.status} />
              <span className="coach-chevron">›</span>
            </button>
          ))}
        </div>
        {student.paymentStatus !== "paid" && (
          <>
            <button
              type="button"
              className="coach-btn-primary"
              disabled={busy}
              onClick={() => run(onMarkPaid)}
              style={{ marginTop: 12 }}
            >
              {busy ? "Actualizando…" : "Marcar como pagado"}
            </button>
            <button
              type="button"
              className="coach-btn-secondary"
              disabled={busy}
              onClick={() => run(onSendReminder)}
            >
              Enviar recordatorio
            </button>
            {student.paymentStatus === "review" && onRequestReceipt && (
              <button
                type="button"
                className="coach-btn-secondary"
                disabled={busy}
                onClick={() => run(onRequestReceipt)}
              >
                Pedir otro comprobante
              </button>
            )}
          </>
        )}
      </section>

      {selectedPayment && (
        <PaymentReceiptSheet
          student={student}
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}

function PerfilTab({ student, onSaveProfile }) {
  const [fullName, setFullName] = useState(student.name);
  const [modality, setModality] = useState(student.modality);
  const [monthlyFee, setMonthlyFee] = useState(String(student.monthlyFee ?? ""));
  const [billingDay, setBillingDay] = useState(
    student.billingDay != null ? String(student.billingDay) : "",
  );
  const [paymentStatus, setPaymentStatus] = useState(student.paymentStatus);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(student.name);
    setModality(student.modality);
    setMonthlyFee(String(student.monthlyFee ?? ""));
    setBillingDay(student.billingDay != null ? String(student.billingDay) : "");
    setPaymentStatus(student.paymentStatus);
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await onSaveProfile({
        fullName: fullName.trim(),
        modality,
        monthlyFee: Number(monthlyFee) || 0,
        billingDay: billingDay === "" ? null : Number(billingDay),
        paymentStatus,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="coach-section">
      <form className="coach-inline-form coach-glass" onSubmit={handleSubmit}>
        <h3 className="coach-section-label">Datos del alumno</h3>
        <label className="coach-field-label" htmlFor="profile-name">
          Nombre completo
        </label>
        <input
          id="profile-name"
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <p className="coach-field-label">Email</p>
        <p className="coach-readonly-value">{student.email || "—"}</p>
        <p className="coach-field-hint">
          Para cambiar el email contacta a soporte; se generará un nuevo enlace de acceso.
        </p>
        <label className="coach-field-label" htmlFor="profile-modality">
          Modalidad
        </label>
        <select
          id="profile-modality"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
        >
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
          <option value="mixto">Mixto</option>
        </select>
        <p className="coach-field-hint">{modalityDescription(modality)}</p>
        <label className="coach-field-label" htmlFor="profile-fee">
          Cuota mensual (CLP)
        </label>
        <input
          id="profile-fee"
          type="number"
          placeholder="Cuota mensual (CLP)"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          min={0}
          step={1000}
        />
        <label className="coach-field-label" htmlFor="profile-billing-day">
          Día de cobro (opcional)
        </label>
        <input
          id="profile-billing-day"
          type="number"
          placeholder="Ej. 5"
          value={billingDay}
          onChange={(e) => setBillingDay(e.target.value)}
          min={1}
          max={28}
        />
        <label className="coach-field-label" htmlFor="profile-payment">
          Estado de pago
        </label>
        <select
          id="profile-payment"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="paid">{paymentStatusLabel("paid")}</option>
          <option value="pending">{paymentStatusLabel("pending")}</option>
          <option value="overdue">{paymentStatusLabel("overdue")}</option>
          <option value="review">{paymentStatusLabel("review")}</option>
        </select>
        <div className="coach-inline-actions">
          <button type="submit" className="coach-btn-primary" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
      <p className="coach-field-hint" style={{ marginTop: 12, padding: "0 4px" }}>
        Modalidad actual: {modalityLabel(student.modality)} ·{" "}
        {formatCLP(student.monthlyFee)}/mes
      </p>
    </section>
  );
}

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "rutina", label: "Rutina" },
  { id: "pagos", label: "Pagos" },
  { id: "perfil", label: "Perfil" },
];

export default function StudentDetailScreen({ student, focusKind, onBack }) {
  const { postComment, publishVideo, markPaid, askReceipt, sendReminder, saveRoutines, saveStudentProfile } = useCoach();
  const initialTab =
    focusKind === "receipt" ? "pagos" : focusKind === "videos" ? "resumen" : "resumen";
  const [tab, setTab] = useState(initialTab);

  return (
    <>
      <NavBar title={student.name} onBack={onBack} />
      <div className="coach-screen coach-screen--detail">
        <div className="coach-student-meta">
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
          <ResumenTab
            student={student}
            focusKind={focusKind}
            onPublishVideo={(videoId, body, exercise) => publishVideo(student.id, videoId, body, exercise)}
            onSubmitComment={(studentId, body, exercise) => postComment(studentId, body, exercise)}
            onConfirmPayment={() => markPaid(student.id)}
            onRequestReceipt={() => askReceipt(student.id)}
          />
        )}
        {tab === "rutina" && (
          <RutinaTab
            student={student}
            onSaveRoutines={(routines, activeRoutineId) =>
              saveRoutines(student.id, routines, activeRoutineId)
            }
          />
        )}
        {tab === "pagos" && (
          <PagosTab
            student={student}
            onMarkPaid={() => markPaid(student.id)}
            onSendReminder={() => sendReminder(student.id)}
            onRequestReceipt={() => askReceipt(student.id)}
          />
        )}
        {tab === "perfil" && (
          <PerfilTab
            student={student}
            onSaveProfile={(profile) => saveStudentProfile(student.id, profile)}
          />
        )}
      </div>
    </>
  );
}
