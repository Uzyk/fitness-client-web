import { useState } from "react";
import { useCoach } from "../context/CoachContext.jsx";

export default function CoachLogin() {
  const { signIn } = useCoach();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-screen">
      <h1 className="coach-large-title">Panel coach</h1>
      <p className="coach-subtitle">Inicia sesión con tu cuenta</p>
      <form className="coach-group coach-glass" style={{ padding: 16 }} onSubmit={handleSubmit}>
        <label className="coach-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <span className="coach-row-subtitle">Email</span>
          <input
            type="email"
            className="coach-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
          />
        </label>
        {error && <p className="coach-row-subtitle coach-row-subtitle--accent">{error}</p>}
        <button type="submit" className="coach-btn-primary" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
