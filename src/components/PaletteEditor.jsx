import { useEffect, useState } from "react";
import { DEFAULT_COACH_THEME, THEME_PRESETS } from "../lib/coachTheme.js";

const FIELDS = [
  { key: "rosado", label: "Rosado" },
  { key: "rosadoPastel", label: "Rosado pastel" },
  { key: "moradoPastel", label: "Morado pastel" },
  { key: "morado", label: "Morado" },
  { key: "celestePastel", label: "Celeste pastel" },
  { key: "celeste", label: "Celeste" },
];

export default function PaletteEditor({ theme, onChange, variant = "dark" }) {
  const [local, setLocal] = useState({ ...DEFAULT_COACH_THEME, ...theme });

  useEffect(() => {
    setLocal({ ...DEFAULT_COACH_THEME, ...theme });
  }, [theme]);

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  };

  const applyPreset = (preset) => {
    setLocal(preset.theme);
    onChange?.(preset.theme);
  };

  return (
    <div className={`palette-editor palette-editor--${variant}`}>
      <div className="palette-presets">
        {THEME_PRESETS.map((p) => (
          <button key={p.id} type="button" className="palette-preset-btn" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>
      <div
        className="palette-preview"
        style={{
          background: `linear-gradient(135deg, ${local.rosadoPastel}, ${local.celestePastel})`,
        }}
      >
        <span style={{ color: local.morado, fontWeight: 700 }}>Vista previa</span>
        <div className="palette-preview-dots">
          <span style={{ background: local.rosado }} />
          <span style={{ background: local.morado }} />
          <span style={{ background: local.celeste }} />
        </div>
      </div>
      <div className="palette-fields">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="palette-field">
            <span>{label}</span>
            <input
              type="color"
              value={local[key]?.startsWith("#") ? local[key] : "#E879A9"}
              onChange={(e) => update(key, e.target.value)}
              disabled={!local[key]?.startsWith("#")}
            />
            <input
              type="text"
              value={local[key]}
              onChange={(e) => update(key, e.target.value)}
              className="palette-hex"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
