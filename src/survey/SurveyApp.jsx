import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, FONTS, GlobalStyles } from "./theme.jsx";
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
    done && survey.whatsapp?.enabled
      ? whatsappUrl(survey.whatsapp.recipient, waMessage)
      : null;

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

  const isLast =
    sectionIdx === sections.length - 1 && questionIdx === section.questions.length - 1;

  return (
    <>
      <GlobalStyles />
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: FONTS.body,
        }}
      >
        <div style={{ width: "100%", maxWidth: "560px" }}>
          {started && !done && (
            <div style={{ marginBottom: "28px", animation: "fadeUp 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span
                  style={{
                    background: COLORS.accent,
                    color: COLORS.accentText,
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    fontFamily: FONTS.mono,
                    letterSpacing: "0.5px",
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
                  height: "3px",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                    borderRadius: "2px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "18px",
              padding: "32px",
              backdropFilter: "blur(10px)",
              animation: "fadeUp 0.4s ease",
            }}
          >
            {!started ? (
              <IntroScreen survey={survey} onStart={() => setStarted(true)} />
            ) : done ? (
              <ResultScreen
                survey={survey}
                answers={answers}
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
                    background: "rgba(200,241,53,0.08)",
                    border: "1px solid rgba(200,241,53,0.2)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: COLORS.accent,
                    fontFamily: FONTS.mono,
                    marginBottom: "12px",
                  }}
                >
                  {section.label}
                </div>
                <h2
                  style={{
                    color: COLORS.textBright,
                    fontFamily: FONTS.display,
                    fontSize: "20px",
                    fontWeight: "700",
                    marginBottom: section.subtitle ? "6px" : "22px",
                    lineHeight: "1.3",
                  }}
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ color: COLORS.muted, fontSize: "14px", marginBottom: "8px" }}>{section.subtitle}</p>
                )}
                {section.intro && (
                  <p
                    style={{
                      background: "rgba(200,241,53,0.06)",
                      borderLeft: `3px solid ${COLORS.accent}`,
                      padding: "12px 14px",
                      margin: "12px 0 20px",
                      fontSize: "14px",
                      color: COLORS.muted,
                      lineHeight: "1.55",
                      borderRadius: "0 8px 8px 0",
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
                    lineHeight: "1.35",
                  }}
                >
                  {question.text}
                  {question.required && <span style={{ color: COLORS.error }}> *</span>}
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
                      background: "transparent",
                      border: `1.5px solid ${COLORS.borderStrong}`,
                      borderRadius: "10px",
                      padding: "13px 18px",
                      color: COLORS.muted,
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canContinue || emailInvalid}
                    style={{
                      flex: 1,
                      background: canContinue && !emailInvalid ? COLORS.accent : "rgba(255,255,255,0.05)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 20px",
                      color: canContinue && !emailInvalid ? COLORS.accentText : "#555",
                      fontFamily: FONTS.body,
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: canContinue && !emailInvalid ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isLast ? "Enviar respuestas" : "Continuar →"}
                  </button>
                </div>
              </>
            )}
          </div>

          {started && !done && (
            <p
              style={{
                color: COLORS.faint,
                fontSize: "12px",
                textAlign: "center",
                marginTop: "16px",
                fontFamily: FONTS.mono,
              }}
            >
              Tus respuestas son confidenciales
            </p>
          )}
        </div>
      </div>
    </>
  );
}
