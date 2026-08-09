import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, FONTS, GlobalStyles, GRADIENTS, PremiumCard, PrimaryButton, SHADOWS } from "./theme.jsx";
import {
  IntroScreen,
  MultiChoice,
  RankChoice,
  ResultScreen,
  SingleChoice,
  TextField,
} from "./components.jsx";
import {
  countAnswered,
  getGlobalStep,
  getTotalQuestions,
  isValidEmail,
  questionAnswered,
} from "./utils.js";
import { buildWhatsAppMessage, saveSurveyResponse, whatsappUrl } from "./submit.js";

function renderQuestion(question, value, onChange) {
  switch (question.type) {
    case "single":
      return <SingleChoice question={question} value={value} onChange={onChange} />;
    case "multi":
      return <MultiChoice question={question} value={value} onChange={onChange} />;
    case "rank":
      return <RankChoice question={question} value={value} onChange={onChange} />;
    case "open":
      return <TextField question={question} value={value || ""} onChange={onChange} multiline />;
    case "text":
    case "email":
    case "tel":
      return <TextField question={question} value={value || ""} onChange={onChange} />;
    default:
      return null;
  }
}

export default function SurveyApp({ survey }) {
  const [started, setStarted] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });
  const submitOnceRef = useRef(false);

  const sections = survey.sections;
  const totalQuestions = getTotalQuestions(sections);
  const section = sections[sectionIdx];
  const question = section?.questions[questionIdx];
  const answered = countAnswered(answers);
  const progress = totalQuestions ? (answered / totalQuestions) * 100 : 0;
  const globalStep = getGlobalStep(sections, sectionIdx, questionIdx);

  const canContinue = question ? questionAnswered(question, answers) : false;
  const emailInvalid = question?.type === "email" && answers[question.id] && !isValidEmail(answers[question.id]);

  const waMessage = useMemo(() => (done ? buildWhatsAppMessage(survey, answers) : ""), [done, survey, answers]);
  const waLink =
    done && survey.whatsapp?.enabled ? whatsappUrl(survey.whatsapp.recipient, waMessage) : null;

  useEffect(() => {
    if (!done) return;
    if (submitOnceRef.current) return;
    submitOnceRef.current = true;

    const run = async () => {
      setSubmitState({ status: "saving", message: "" });
      const result = await saveSurveyResponse(survey, answers);
      if (result.skipped) {
        setSubmitState({ status: "skipped", message: result.message });
      } else if (result.ok) {
        setSubmitState({ status: "saved", message: "" });
      } else {
        setSubmitState({ status: "error", message: result.message });
      }
    };

    run();
  }, [done, survey, answers]);

  const next = () => {
    const nextQ = questionIdx + 1;
    if (nextQ < section.questions.length) {
      setQuestionIdx(nextQ);
    } else {
      const nextS = sectionIdx + 1;
      if (nextS < sections.length) {
        setSectionIdx(nextS);
        setQuestionIdx(0);
      } else {
        setDone(true);
      }
    }
  };

  const back = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else if (sectionIdx > 0) {
      const prev = sections[sectionIdx - 1];
      setSectionIdx(sectionIdx - 1);
      setQuestionIdx(prev.questions.length - 1);
    } else {
      setStarted(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const isLast = sectionIdx === sections.length - 1 && questionIdx === section.questions.length - 1;

  return (
    <>
      <GlobalStyles />
      <div
        style={{
          minHeight: "100vh",
          background: GRADIENTS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily: FONTS.body,
        }}
      >
      <div
        className="survey-shell"
        style={{
          width: "100%",
          maxWidth: "580px",
        }}
      >
          {started && !done && (
            <div style={{ marginBottom: "24px", animation: "fadeUp 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span
                  style={{
                    background: GRADIENTS.primary,
                    color: COLORS.accentText,
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "700",
                    fontFamily: FONTS.mono,
                    letterSpacing: "0.1em",
                    boxShadow: SHADOWS.glow,
                  }}
                >
                  {survey.badge}
                </span>
                <span style={{ color: COLORS.dim, fontSize: "12px", fontFamily: FONTS.mono }}>
                  {globalStep} / {totalQuestions}
                </span>
              </div>
              <div
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: GRADIENTS.progress,
                    borderRadius: "4px",
                    transition: "width 0.35s ease",
                    boxShadow: SHADOWS.glow,
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ animation: "fadeUp 0.45s ease" }}>
            <PremiumCard>
              {!started ? (
                <IntroScreen survey={survey} onStart={() => setStarted(true)} />
              ) : done ? (
                <ResultScreen
                  survey={survey}
                  submitState={submitState}
                  waLink={waLink}
                  onCopy={handleCopy}
                  copied={copied}
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "inline-block",
                      background: COLORS.accentMuted,
                      border: `1px solid ${COLORS.accentBorder}`,
                      borderRadius: "20px",
                      padding: "5px 14px",
                      fontSize: "11px",
                      color: COLORS.accentLight,
                      fontFamily: FONTS.mono,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "14px",
                    }}
                  >
                    {section.label}
                  </div>
                  <h2
                    style={{
                      color: COLORS.textBright,
                      fontFamily: FONTS.display,
                      fontSize: "22px",
                      fontWeight: "700",
                      marginBottom: section.subtitle ? "6px" : "20px",
                      lineHeight: "1.25",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p style={{ color: COLORS.dim, fontSize: "14px", marginBottom: "10px" }}>{section.subtitle}</p>
                  )}
                  {section.intro && (
                    <p
                      style={{
                        background: COLORS.accentMuted,
                        borderLeft: `3px solid ${COLORS.accent}`,
                        padding: "14px 16px",
                        margin: "14px 0 22px",
                        fontSize: "14px",
                        color: COLORS.muted,
                        lineHeight: "1.6",
                        borderRadius: "0 10px 10px 0",
                      }}
                    >
                      {section.intro}
                    </p>
                  )}

                  <h3
                    style={{
                      color: COLORS.textBright,
                      fontFamily: FONTS.display,
                      fontSize: "17px",
                      fontWeight: "600",
                      marginBottom: "18px",
                      lineHeight: "1.4",
                    }}
                  >
                    {question.text}
                    {question.required && <span style={{ color: COLORS.accentLight }}> *</span>}
                  </h3>

                  <div style={{ marginBottom: "28px" }}>
                    {renderQuestion(question, answers[question.id], (v) =>
                      setAnswers((prev) => ({ ...prev, [question.id]: v })),
                    )}
                    {emailInvalid && (
                      <p style={{ marginTop: "8px", color: COLORS.error, fontSize: "12px", fontFamily: FONTS.mono }}>
                        Email inválido
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={back}
                      style={{
                        flex: "0 0 auto",
                        background: "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${COLORS.borderStrong}`,
                        borderRadius: "12px",
                        padding: "13px 18px",
                        color: COLORS.muted,
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      ←
                    </button>
                    <PrimaryButton
                      onClick={next}
                      disabled={!canContinue || emailInvalid}
                      fullWidth={false}
                      style={{ flex: 1 }}
                    >
                      {isLast ? "Enviar respuestas" : "Continuar →"}
                    </PrimaryButton>
                  </div>
                </>
              )}
            </PremiumCard>
          </div>

          {started && !done && (
            <p
              style={{
                color: COLORS.faint,
                fontSize: "11px",
                textAlign: "center",
                marginTop: "18px",
                fontFamily: FONTS.mono,
                letterSpacing: "0.04em",
              }}
            >
              INFORMACIÓN CONFIDENCIAL · STUDIO FIT
            </p>
          )}
        </div>
      </div>
    </>
  );
}
