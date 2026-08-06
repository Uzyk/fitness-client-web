import { site } from "../config/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <span className={styles.logoMark}>◆</span>
            {site.name}
          </span>
          <p>{site.description}</p>
        </div>

        <div className={styles.links}>
          <a href="#servicios">Servicios</a>
          <a href="#planes">Planes</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </div>

        <div className={styles.social}>
          {site.social.instagram && (
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {site.social.tiktok && (
            <a href={site.social.tiktok} target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          )}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {year} {site.name}. Todos los derechos reservados.</span>
        <span className={styles.note}>Sitio en desarrollo · Cliente fitness</span>
      </div>
    </footer>
  );
}