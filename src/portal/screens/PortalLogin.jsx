import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function PortalLogin() {
  const { login } = useAuth();
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
    <div className="portal-auth">
      <div className="portal-auth-card">
        <p className="portal-eyebrow">Studio Fit</p>
        <h1 className="portal-title">Iniciar sesión</h1>
        <p className="portal-subtitle">
          Accede con tu cuenta de administrador, coach o alumno.
        </p>
        <form className="portal-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="portal-error">{error}</p>}
          <button type="submit" className="portal-btn-primary" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
