import { services } from "../config/site";
import styles from "./Services.module.css";

export default function Services() {
  return (
    <section id="servicios" className="section">
      <div className="container">
        <span className="section-label">SERVICIOS</span>
        <h2 className="section-title">Todo lo que necesitas para transformarte</h2>
        <p className="section-subtitle">
          Programas diseñados con metodología basada en evidencia. Sin promesas vacías, con seguimiento real.
        </p>

        <div className={styles.grid}>
          {services.map((service) => (
            <article key={service.id} className={styles.card}>
              <span className={styles.icon}>{service.icon}</span>
              <h3 className={styles.title}>{service.title}</h3>
              <p className={styles.description}>{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}