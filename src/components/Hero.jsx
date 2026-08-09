import { site, stats } from "../config/site";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.content}>
          <span className="section-label">FITNESS · BIENESTAR</span>
          <h1 className={styles.title}>{site.tagline}</h1>
          <p className={styles.description}>{site.description}</p>
          <div className={styles.actions}>
            <a href="#contacto" className="btn btn-primary">
              {site.cta.primary} →
            </a>
            <a href="#planes" className="btn btn-secondary">
              {site.cta.secondary}
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.card}>
            <div className={styles.cardGlow} />
            <div className={styles.cardInner}>
              <span className={styles.cardBadge}>HOY</span>
              <p className={styles.cardTitle}>Tu próximo entrenamiento</p>
              <ul className={styles.cardList}>
                <li>Calentamiento dinámico · 8 min</li>
                <li>Fuerza · Press banca 4×8</li>
                <li>Accesorios · Remo con mancuerna</li>
                <li>Enfriamiento · Movilidad hombro</li>
              </ul>
              <a href={site.portalUrl} className={styles.cardBtn}>
                Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.stats}`}>
        {stats.map((item) => (
          <div key={item.label} className={styles.stat}>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}