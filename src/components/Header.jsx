import { useState } from "react";
import { site } from "../config/site";
import styles from "./Header.module.css";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#planes", label: "Planes" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#" className={styles.logo}>
          <span className={styles.logoMark}>◆</span>
          {site.name}
        </a>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#contacto" className={styles.navCta} onClick={() => setOpen(false)}>
            {site.cta.primary}
          </a>
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}