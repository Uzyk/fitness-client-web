import { COLORS, FONTS, GRADIENTS, PrimaryButton, SHADOWS } from "./theme.jsx";

export function SingleChoice({ question, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {question.options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              background: selected ? GRADIENTS.primary : COLORS.cardInput,
              border: selected ? "1.5px solid transparent" : `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "12px",
              padding: "14px 18px",
              color: selected ? COLORS.accentText : COLORS.text,
              fontFamily: FONTS.body,
              fontSize: "15px",
              fontWeight: selected ? "600" : "400",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: selected ? SHADOWS.glow : "none",
            }}
          >
            {opt}
          </button>
        );
      })}
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
      <p style={{ color: COLORS.dim, fontSize: "13px", margin: "0 0 4px 0", fontFamily: FONTS.body }}>
        Puede seleccionar varias opciones
      </p>
      {question.options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              background: selected ? COLORS.accentMuted : COLORS.cardInput,
              border: selected ? `1.5px solid ${COLORS.accentBorder}` : `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "12px",
              padding: "14px 18px",
              color: selected ? COLORS.accentLight : COLORS.text,
              fontFamily: FONTS.body,
              fontSize: "15px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "5px",
                flexShrink: 0,
                background: selected ? GRADIENTS.primary : "transparent",
                border: selected ? "none" : `1.5px solid ${COLORS.borderStrong}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected && (
                <span style={{ color: COLORS.accentText, fontSize: "11px", fontWeight: "bold" }}>✓</span>
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
      <p style={{ color: COLORS.dim, fontSize: "13px", margin: "0 0 4px 0", fontFamily: FONTS.body }}>
        Asigne un número del 1 al {maxRank} (1 = más importante)
      </p>
      {question.options.map((opt) => {
        const assigned = value[opt] ?? null;
        return (
          <div
            key={opt}
            style={{
              background: assigned ? COLORS.accentMuted : COLORS.cardInput,
              border: assigned ? `1.5px solid ${COLORS.accentBorder}` : `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "12px",
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
                      borderRadius: "8px",
                      background: assigned === n ? GRADIENTS.primary : taken ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                      border: assigned === n ? "none" : `1px solid ${COLORS.borderStrong}`,
                      color: assigned === n ? COLORS.accentText : taken ? COLORS.faint : COLORS.muted,
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
            <span style={{ color: assigned ? COLORS.textBright : COLORS.muted, fontSize: "14px", fontFamily: FONTS.body }}>
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
  borderRadius: "12px",
  padding: "14px 16px",
  color: COLORS.text,
  fontFamily: FONTS.body,
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: "1.5",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export function TextField({ question, value = "", onChange, multiline = false }) {
  const focus = (e) => {
    e.target.style.border = `1.5px solid ${COLORS.accent}`;
    e.target.style.boxShadow = SHADOWS.glow;
  };
  const blur = (e) => {
    e.target.style.border = `1.5px solid ${COLORS.borderInput}`;
    e.target.style.boxShadow = "none";
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Escriba aquí su respuesta..."}
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
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        {brand && (
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: GRADIENTS.primary,
              boxShadow: SHADOWS.button,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.accentText,
              fontSize: "18px",
              fontWeight: "800",
              flexShrink: 0,
            }}
          >
            {brand.mark || "◆"}
          </div>
        )}
        <div>
          {brand && (
            <>
              <h2
                style={{
                  color: COLORS.textBright,
                  fontFamily: FONTS.display,
                  fontSize: "24px",
                  fontWeight: "800",
                  margin: 0,
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}
              >
                {brand.name}
              </h2>
              <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "13px", margin: "5px 0 0 0" }}>
                {brand.tagline}
              </p>
            </>
          )}
          <p
            style={{
              color: COLORS.accentLight,
              fontFamily: FONTS.mono,
              fontSize: "11px",
              margin: "10px 0 0 0",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: "500",
            }}
          >
            {survey.title}
          </p>
          <p style={{ color: COLORS.dim, fontFamily: FONTS.body, fontSize: "13px", margin: "4px 0 0 0" }}>
            {survey.subtitle}
          </p>
        </div>
      </div>

      {intro.highlight && (
        <div
          style={{
            background: COLORS.accentMuted,
            border: `1px solid ${COLORS.accentBorder}`,
            borderRadius: "12px",
            padding: "16px 18px",
            marginBottom: "18px",
            color: COLORS.accentLight,
            fontFamily: FONTS.body,
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {intro.highlight}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "14px", lineHeight: "1.6" }}>
          {intro.description}
        </div>
      </div>

      {intro.bullets?.length > 0 && (
        <ul
          style={{
            margin: "0 0 22px 0",
            paddingLeft: "18px",
            color: COLORS.dim,
            fontSize: "14px",
            lineHeight: "1.7",
          }}
        >
          {intro.bullets.map((b) => (
            <li key={b} style={{ marginBottom: "4px" }}>
              {b}
            </li>
          ))}
        </ul>
      )}

      <PrimaryButton onClick={onStart}>{intro.startLabel || "Iniciar formulario →"}</PrimaryButton>

      {intro.footer && (
        <p
          style={{
            marginTop: "16px",
            color: COLORS.faint,
            fontSize: "11px",
            textAlign: "center",
            fontFamily: FONTS.mono,
            letterSpacing: "0.05em",
          }}
        >
          {intro.footer}
        </p>
      )}
    </div>
  );
}

export function ResultScreen({ survey, submitState, waLink, onCopy, copied }) {
  const badge =
    submitState.status === "saving"
      ? { bg: "rgba(255,255,255,0.04)", border: COLORS.borderStrong, color: COLORS.muted, text: "Guardando respuestas…" }
      : submitState.status === "saved"
        ? { bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.3)", color: COLORS.success, text: "Respuestas guardadas correctamente." }
        : submitState.status === "skipped"
          ? { bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.3)", color: "#FBBF24", text: "Base de datos no configurada." }
          : submitState.status === "error"
            ? { bg: "rgba(248, 113, 113, 0.08)", border: "rgba(248, 113, 113, 0.3)", color: COLORS.error, text: "No se pudo guardar en la base de datos." }
            : null;

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: GRADIENTS.primary,
          boxShadow: SHADOWS.button,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "28px",
          animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        ✓
      </div>
      <h2
        style={{
          background: GRADIENTS.primary,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: FONTS.display,
          fontSize: "26px",
          fontWeight: "800",
          margin: "0 0 10px 0",
        }}
      >
        Formulario completado
      </h2>
      <p style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: "15px", margin: "0 0 22px 0", lineHeight: "1.55" }}>
        {survey.result?.message || "Sus respuestas han sido registradas."}
      </p>

      {badge && (
        <div style={{ textAlign: "left", marginBottom: "18px" }}>
          <div
            style={{
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              borderRadius: "12px",
              padding: "12px 16px",
              color: badge.color,
              fontFamily: FONTS.body,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {badge.text}
            {submitState.status === "error" && submitState.message ? (
              <div style={{ marginTop: "6px", color: COLORS.error, fontSize: "12px", fontFamily: FONTS.mono, opacity: 0.9 }}>
                {submitState.message}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {survey.whatsapp?.enabled && waLink && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
          <PrimaryButton as="a" href={waLink}>
            Enviar por WhatsApp →
          </PrimaryButton>
          <button
            type="button"
            onClick={onCopy}
            style={{
              width: "100%",
              background: "transparent",
              border: `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: "12px",
              padding: "13px 18px",
              color: COLORS.muted,
              fontFamily: FONTS.body,
              fontSize: "15px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {copied ? "Copiado al portapapeles" : "Copiar respuestas"}
          </button>
        </div>
      )}

      <p style={{ color: COLORS.faint, fontFamily: FONTS.mono, fontSize: "11px", letterSpacing: "0.04em" }}>
        {survey.brand?.name ? `${survey.brand.name.toUpperCase()} · ` : ""}
        {survey.title.toUpperCase()}
      </p>
    </div>
  );
}
