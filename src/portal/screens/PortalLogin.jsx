import { useState } from "react";
import { useTheme } from "../../coach/hooks/useTheme.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function PortalLogin() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-app" data-theme={theme}>
      <main className="coach-main coach-main--student">
        <div className="coach-screen">
          <p className="coach-studio-name">Studio Fit</p>
          <h1 className="coach-large-title">Iniciar sesión</h1>
          <p className="coach-subtitle">
            Accede con tu cuenta de administrador, coach o alumno.
          </p>
          <form
            className="coach-group coach-glass"
            style={{ padding: 16, marginTop: 8 }}
            onSubmit={handleSubmit}
          >
            <label className="coach-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span className="coach-row-subtitle">Email</span>
              <input
                type="email"
                className="coach-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="coach-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <span className="coach-row-subtitle">Contraseña</span>
              <input
                type="password"
                className="coach-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error && (
              <p className="coach-row-subtitle coach-row-subtitle--accent">{error}</p>
            )}
            <button type="submit" className="coach-btn-primary" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
