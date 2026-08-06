import styles from "./About.module.css";

const values = [
  {
    title: "Basado en evidencia",
    text: "Programas fundamentados en ciencia del ejercicio, no en modas pasajeras.",
  },
  {
    title: "Personalización real",
    text: "Cada plan se adapta a tu historial, lesiones, horarios y objetivos.",
  },
  {
    title: "Comunidad activa",
    text: "Entrenar acompañado multiplica la adherencia y los resultados.",
  },
];

export default function About() {
  return (
    <section id="nosotros" className="section">
      <div className={`container ${styles.grid}`}>
        <div>
          <span className="section-label">NOSOTROS</span>
          <h2 className="section-title">Más que un gimnasio, un equipo a tu lado</h2>
          <p className={styles.text}>
            Llevamos años ayudando a personas a construir hábitos sostenibles. No vendemos transformaciones
            de 30 días: acompañamos procesos reales con seguimiento, ajustes y motivación constante.
          </p>
          <p className={styles.disclaimer}>
            No diagnosticamos lesiones ni prescribimos dietas clínicas. Ante dolor, enfermedad o embarazo,
            recomendamos consulta con un profesional de salud.
          </p>
        </div>

        <div className={styles.values}>
          {values.map((item) => (
            <div key={item.title} className={styles.value}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}