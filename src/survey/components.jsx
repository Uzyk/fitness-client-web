import { COLORS, FONTS } from "./theme.jsx";

export function SingleChoice({ question, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {question.options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            background: value === opt ? COLORS.accent : COLORS.cardInput,
            border: value === opt ? `1.5px solid ${COLORS.accent}` : `1.5px solid ${COLORS.borderStrong}`,
            borderRadius: "10px",
            padding: "14px 18px",
            color: value === opt ? COLORS.accentText : COLORS.text,
            fontFamily: FONTS.body,
            fontSize: "15px",
            fontWeight: value === opt ? "600" : "400",
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function MultiChoice({ question, value = [], onChange }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ color: COLORS.muted, fontSize: "13px", margin: "0 0 4px 0", fontFamily: FONTS.body }}>
        Puedes seleccionar varias opciones
      </p>
      {question.options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              background: selected ? "rgba(200, 241, 53, 0.12)" : COLORS.cardInput,
              border: selected ? `1.5px solid ${COLORS.accent}` : `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "10px",
              padding: "14px 18px",
              color: selected ? COLORS.accent : COLORS.text,
              fontFamily: FONTS.body,
              fontSize: "15px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                flexShrink: 0,
                background: selected ? COLORS.accent : "transparent",
                border: selected ? "none" : `1.5px solid rgba(255,255,255,0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected && (
                <span style={{ color: COLORS.accentText, fontSize: "12px", fontWeight: "bold" }}>✓</span>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function RankChoice({ question, value = {}, onChange }) {
  const assign = (opt, rank) => {
    const cleaned = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== rank));
    onChange({ ...cleaned, [opt]: rank });
  };
  const currentRanks = Object.values(value);
  const maxRank = question.options.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ color: COLORS.muted, fontSize: "13px", margin: "0 0 4px 0", fontFamily: FONTS.body }}>
        Asigna un número del 1 al {maxRank} (1 = más importante)
      </p>
      {question.options.map((opt) => {
        const assigned = value[opt] ?? null;
        return (
          <div
            key={opt}
            style={{
              background: assigned ? "rgba(200,241,53,0.07)" : COLORS.cardInput,
              border: assigned ? "1.5px solid rgba(200,241,53,0.4)" : `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {Array.from({ length: maxRank }, (_, i) => i + 1).map((n) => {
                const taken = currentRanks.includes(n) && value[opt] !== n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      if (!taken) assign(opt, n);
                    }}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      background: assigned === n ? COLORS.accent : taken ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
                      border: assigned === n ? "none" : "1px solid rgba(255,255,255,0.15)",
                      color: assigned === n ? COLORS.accentText : taken ? "#444" : "#aaa",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: taken ? "default" : "pointer",
                      fontFamily: FONTS.mono,
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <span style={{ color: assigned ? COLORS.text : "#AAA", fontSize: "14px", fontFamily: FONTS.body }}>
              {opt}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: COLORS.cardInput,
  border: `1.5px solid ${COLORS.borderInput}`,
  borderRadius: "10px",
  padding: "14px 16px",
  color: COLORS.text,
  fontFamily: FONTS.body,
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: "1.5",
};

export function TextField({ question, value = "", onChange, multiline = false }) {
  const focus = (e) => {
    e.target.style.border = `1.5px solid ${COLORS.accent}`;
  };
  const blur = (e) => {
    e.target.style.border = `1.5px solid ${COLORS.borderInput}`;
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Escribe aquí tu respuesta..."}
        rows={4}
        style={{ ...inputStyle, resize: "vertical" }}
        onFocus={focus}
        onBlur={blur}
      />
    );
  }

  return (
    <input
      type={question.type === "email" ? "email" : question.type === "tel" ? "tel" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder || ""}
      style={inputStyle}
      onFocus={focus}
      onBlur={blur}
    />
  );
}

export function IntroScreen({ survey, onStart }) {
  const { intro, brand } = survey;

  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        {brand ? (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(200, 241, 53, 0.12)",
              border: "1px solid rgba(200, 241, 53, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.accent,
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            {brand.mark || "◆"}
          </div>
        ) : (
          <div style={{ fontSize: "34px" }}>{intro.icon}</div>
        )}
        <div>
          {brand && (
            <>
              <h2
                style={{
                  color: COLORS.textBright,
                  fontFamily: FONTS.display,
                  fontSize: "22px",
                  fontWeight: "800",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                {brand.name}
              </h2>
              <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "13px", margin: "4px 0 0 0" }}>
                {brand.tagline}
              </p>
            </>
          )}
          <p
            style={{
              color: brand ? COLORS.accent : COLORS.muted,
              fontFamily: brand ? FONTS.mono : FONTS.body,
              fontSize: brand ? "12px" : "14px",
              margin: brand ? "10px 0 0 0" : "6px 0 0 0",
              letterSpacing: brand ? "0.3px" : undefined,
              fontWeight: brand ? "600" : undefined,
            }}
          >
            {survey.title}
          </p>
          {!brand && (
            <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "14px", margin: "6px 0 0 0" }}>
              {survey.subtitle}
            </p>
          )}
          {brand && (
            <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "14px", margin: "4px 0 0 0" }}>
              {survey.subtitle}
            </p>
          )}
        </div>
      </div>

      {intro.highlight && (
        <div
          style={{
            background: "rgba(200, 241, 53, 0.08)",
            border: "1px solid rgba(200, 241, 53, 0.25)",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "16px",
            color: COLORS.accent,
            fontFamily: FONTS.body,
            fontSize: "14px",
            lineHeight: "1.55",
          }}
        >
          {intro.highlight}
        </div>
      )}

      <div style={{ marginBottom: "18px" }}>
        <div style={{ color: "#BDBDBD", fontFamily: FONTS.body, fontSize: "14px", lineHeight: "1.5" }}>
          {intro.description}
        </div>
        {intro.note && (
          <div
            style={{
              color: "#666",
              fontFamily: FONTS.mono,
              fontSize: "12px",
              lineHeight: "1.5",
              marginTop: "8px",
            }}
          >
            {intro.note}
          </div>
        )}
      </div>

      {intro.bullets?.length > 0 && (
        <ul
          style={{
            margin: "0 0 18px 0",
            paddingLeft: "18px",
            color: COLORS.muted,
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {intro.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onStart}
        style={{
          width: "100%",
          background: COLORS.accent,
          border: "none",
          borderRadius: "10px",
          padding: "14px 20px",
          color: COLORS.accentText,
          fontFamily: FONTS.body,
          fontSize: "15px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {intro.startLabel || "Comenzar →"}
      </button>

      {intro.footer && (
        <p
          style={{
            marginTop: "14px",
            color: COLORS.faint,
            fontSize: "12px",
            textAlign: "center",
            fontFamily: FONTS.mono,
          }}
        >
          {intro.footer}
        </p>
      )}
    </div>
  );
}

export function ResultScreen({ survey, answers, submitState, waLink, onCopy, copied }) {
  const badge =
    submitState.status === "saving"
      ? { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.18)", color: COLORS.muted, text: "Guardando respuestas…" }
      : submitState.status === "saved"
        ? { bg: "rgba(126,200,148,0.10)", border: "rgba(126,200,148,0.35)", color: COLORS.success, text: "Respuestas guardadas." }
        : submitState.status === "skipped"
          ? { bg: "rgba(255,193,7,0.10)", border: "rgba(255,193,7,0.35)", color: "#FFC107", text: "Supabase no configurado: respuestas solo locales." }
          : submitState.status === "error"
            ? { bg: "rgba(255,83,83,0.10)", border: "rgba(255,83,83,0.35)", color: COLORS.error, text: "No se pudo guardar en la base de datos." }
            : null;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px", animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        🎯
      </div>
      <h2
        style={{
          color: COLORS.accent,
          fontFamily: FONTS.display,
          fontSize: "26px",
          fontWeight: "800",
          margin: "0 0 8px 0",
        }}
      >
        ¡Gracias por tu tiempo!
      </h2>
      <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "15px", margin: "0 0 18px 0" }}>
        {survey.result?.message || "Tus respuestas nos ayudan a armar la mejor propuesta."}
      </p>

      {badge && (
        <div style={{ textAlign: "left", marginBottom: "16px" }}>
          <div
            style={{
              background: badge.bg,
              border: `1.5px solid ${badge.border}`,
              borderRadius: "12px",
              padding: "12px 14px",
              color: badge.color,
              fontFamily: FONTS.body,
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {badge.text}
            {submitState.status === "error" && submitState.message ? (
              <div
                style={{
                  marginTop: "6px",
                  color: "#FFB3B3",
                  fontWeight: "500",
                  fontSize: "12px",
                  fontFamily: FONTS.mono,
                }}
              >
                {submitState.message}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {survey.whatsapp?.enabled && waLink && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              background: COLORS.accent,
              border: "none",
              borderRadius: "10px",
              padding: "14px 20px",
              color: COLORS.accentText,
              fontFamily: FONTS.body,
              fontSize: "15px",
              fontWeight: "700",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Enviar por WhatsApp →
          </a>
          <button
            type="button"
            onClick={onCopy}
            style={{
              width: "100%",
              background: "transparent",
              border: `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "10px",
              padding: "13px 18px",
              color: COLORS.muted,
              fontFamily: FONTS.body,
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {copied ? "¡Copiado!" : "Copiar respuestas"}
          </button>
        </div>
      )}

      <p style={{ color: COLORS.dim, fontFamily: FONTS.body, fontSize: "13px" }}>
        {survey.brand?.name ? `${survey.brand.name} · ` : ""}{survey.title}
      </p>
    </div>
  );
}
