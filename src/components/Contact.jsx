import { useState } from "react";
import { site } from "../config/site";
import styles from "./Contact.module.css";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contacto" className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <div>
          <span className="section-label">CONTACTO</span>
          <h2 className="section-title">Reserva tu evaluación gratuita</h2>
          <p className="section-subtitle">
            Cuéntanos tu objetivo y te contactamos en menos de 24 horas para agendar tu primera sesión.
          </p>

          <div className={styles.info}>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
            <a
              href={`https://wa.me/${site.whatsapp}?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20${encodeURIComponent(site.name)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp →
            </a>
            <span>{site.address}</span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {sent ? (
            <div className={styles.success}>
              <span className={styles.successIcon}>✅</span>
              <h3>¡Mensaje recibido!</h3>
              <p>Te contactaremos pronto para coordinar tu evaluación.</p>
            </div>
          ) : (
            <>
              <label>
                Nombre
                <input type="text" name="name" required placeholder="Tu nombre" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="tu@email.com" />
              </label>
              <label>
                Teléfono
                <input type="tel" name="phone" placeholder="+56 9 ..." />
              </label>
              <label>
                ¿Cuál es tu objetivo?
                <select name="goal" required defaultValue="">
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  <option value="perder-grasa">Perder grasa</option>
                  <option value="ganar-musculo">Ganar músculo</option>
                  <option value="rendimiento">Mejorar rendimiento</option>
                  <option value="salud">Salud y bienestar general</option>
                  <option value="rehab">Recuperación / movilidad</option>
                </select>
              </label>
              <label>
                Mensaje (opcional)
                <textarea name="message" rows={3} placeholder="Cuéntanos más sobre ti..." />
              </label>
              <button type="submit" className="btn btn-primary">
                Enviar solicitud →
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}