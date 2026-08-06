import { plans } from "../config/site";
import styles from "./Plans.module.css";

export default function Plans() {
  return (
    <section id="planes" className={`section ${styles.section}`}>
      <div className="container">
        <span className="section-label">PLANES</span>
        <h2 className="section-title">Elige el plan que encaja contigo</h2>
        <p className="section-subtitle">
          Membresías flexibles sin permanencia. Evaluación inicial incluida en todos los planes.
        </p>

        <div className={styles.grid}>
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.card} ${plan.highlighted ? styles.highlighted : ""}`}
            >
              {plan.highlighted && <span className={styles.badge}>Más popular</span>}
              <h3 className={styles.name}>{plan.name}</h3>
              <div className={styles.price}>
                <span className={styles.amount}>${plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a href="#contacto" className={`btn ${plan.highlighted ? "btn-primary" : "btn-secondary"} ${styles.cta}`}>
                Empezar ahora
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}