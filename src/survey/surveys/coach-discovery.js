/**
 * Encuesta: Discovery coach online (cobros + planificación)
 * Slug URL: ?s=coach-discovery  (default)
 */
export const coachDiscoverySurvey = {
  slug: "coach-discovery",
  badge: "STUDIO FIT",
  title: "Formulario de discovery",
  subtitle: "Coaching online · Cobros y planificación",

  brand: {
    name: "Studio Fit",
    tagline: "Soluciones digitales para el sector fitness",
    mark: "◆",
  },

  intro: {
    description:
      "Este formulario toma aproximadamente 8–10 minutos. La información proporcionada es confidencial y será utilizada exclusivamente para el diseño de su proyecto.",
    highlight:
      "Objetivo del formulario: recopilar información sobre su operación actual y evaluar una propuesta de desbloqueo de planificación tras confirmación de pago por transferencia.",
    bullets: [
      "Preguntas sobre su modelo de trabajo y cobros",
      "Evaluación de la propuesta técnica planteada",
      "Las respuestas quedan registradas de forma segura",
    ],
    startLabel: "Iniciar formulario →",
    footer: "Studio Fit · Confidencial",
  },

  result: {
    message:
      "Sus respuestas han sido registradas. Estas serán utilizadas para elaborar una propuesta acorde a sus necesidades.",
  },

  whatsapp: {
    enabled: true,
    recipient: import.meta.env.VITE_WHATSAPP_RECIPIENT || "56912345678",
  },

  sections: [
    {
      id: "perfil",
      label: "Perfil",
      title: "Información general",
      subtitle: "Datos básicos para contextualizar el proyecto",
      questions: [
        {
          id: "nombre",
          text: "Nombre completo",
          type: "text",
          required: true,
          placeholder: "Su nombre",
        },
        {
          id: "marca",
          text: "Nombre de su marca o negocio como coach",
          type: "text",
          required: true,
          placeholder: "Ej: Coach Personal María, Studio Wellness...",
        },
        {
          id: "modalidad",
          text: "¿Cuál es su modalidad de trabajo actual con alumnos?",
          type: "multi",
          required: true,
          options: [
            "Presencial en gimnasio",
            "Presencial a domicilio",
            "Online (videollamada / seguimiento remoto)",
            "Solo envío de planificaciones (sin sesión en vivo)",
            "Mix presencial + online",
          ],
        },
      ],
    },
    {
      id: "cobros",
      label: "Cobros",
      title: "Gestión de cobros",
      subtitle: "Comprensión del flujo de pagos actual",
      questions: [
        {
          id: "metodo_pago",
          text: "¿Qué medios de pago utilizan sus alumnos habitualmente?",
          type: "multi",
          required: true,
          options: ["Transferencia bancaria", "Efectivo", "Tarjeta / POS", "Otro medio digital"],
        },
        {
          id: "frecuencia_cobro",
          text: "¿Con qué frecuencia realiza cobros?",
          type: "single",
          required: true,
          options: [
            "Por cada sesión",
            "Semanal",
            "Quincenal",
            "Mensual",
            "Por pack de sesiones (ej: 8 sesiones)",
            "No tengo un sistema fijo",
          ],
        },
        {
          id: "problemas_cobro",
          text: "¿Qué dificultades enfrenta en la gestión de cobros? (Seleccione todas las que apliquen)",
          type: "multi",
          required: true,
          options: [
            "Olvido cobrar a tiempo",
            "Entrega más sesiones de las pagadas",
            "No lleva un registro claro de pagos",
            "Los alumnos pagan tarde o incompleto",
            "Pérdida de tiempo gestionando comprobantes",
            "Desconocimiento del total adeudado",
            "Dificultad para recordar cobros pendientes",
            "Otro",
          ],
        },
        {
          id: "registro_actual",
          text: "¿Cómo registra actualmente el control de pagos?",
          type: "single",
          required: true,
          options: [
            "Excel o Google Sheets",
            "Cuaderno / libreta",
            "Memoria y chats de WhatsApp",
            "App de entrenamiento",
            "No llevo registro",
            "Otro",
          ],
        },
        {
          id: "problema_cobro_detalle",
          text: "Describa brevemente el principal problema en la gestión de cobros",
          type: "open",
          required: false,
          placeholder: "Ej: Falta de control entre sesiones realizadas y pagos recibidos...",
        },
      ],
    },
    {
      id: "planificacion",
      label: "Planificación",
      title: "Entrega de planificación",
      subtitle: "Información para diseñar el flujo de desbloqueo",
      questions: [
        {
          id: "entrega_plan",
          text: "¿Cómo entrega actualmente la planificación a sus alumnos?",
          type: "multi",
          required: true,
          options: [
            "WhatsApp (PDF, Excel, foto, texto)",
            "Email",
            "Presencial (en sesión)",
            "App (Hevy, TrueCoach, etc.)",
            "Google Drive / link compartido",
            "Aún no tengo un formato definido",
          ],
        },
        {
          id: "alumnos_activos",
          text: "¿Cuántos alumnos activos tiene aproximadamente?",
          type: "single",
          required: true,
          options: ["1–5", "6–15", "16–30", "Más de 30"],
        },
        {
          id: "renovacion_plan",
          text: "¿Con qué frecuencia renueva o actualiza la planificación?",
          type: "single",
          required: true,
          options: ["Cada sesión", "Semanal", "Cada 2–4 semanas", "Mensual", "Cuando el alumno lo solicita"],
        },
        {
          id: "precio_referencia",
          text: "Rango de precio por sesión o plan (opcional)",
          type: "text",
          required: false,
          placeholder: "Ej: $25.000 por sesión, $80.000 mensual...",
        },
      ],
    },
    {
      id: "propuesta",
      label: "Propuesta",
      title: "Desbloqueo con comprobante",
      subtitle: "Evaluación de la propuesta técnica",
      intro:
        "Propuesta: el alumno carga el comprobante de transferencia, usted lo confirma y recién entonces se habilita el acceso a la planificación. De este modo, la sesión o plan queda pagado antes de su entrega.",
      questions: [
        {
          id: "idea_desbloqueo",
          text: "¿Esta propuesta se ajusta a las necesidades de su negocio?",
          type: "single",
          required: true,
          options: [
            "Sí, resolvería el problema principal",
            "Sí, con algunos ajustes",
            "Requiere evaluación adicional",
            "No, prefiero otro enfoque",
          ],
        },
        {
          id: "ajustes_flujo",
          text: "¿Qué ajustes consideraría necesarios o qué aspectos generan dudas?",
          type: "open",
          required: false,
          placeholder: "Ej: Excepciones para alumnos de confianza, desbloqueo manual...",
        },
        {
          id: "sin_pago",
          text: "Si un alumno no ha pagado, ¿cuál debería ser el comportamiento del sistema?",
          type: "multi",
          required: true,
          options: [
            "Bloqueo total de la planificación",
            "Mensaje de estado: pendiente de pago",
            "Recordatorio automático",
            "Acceso presencial sin plan online",
            "Gestión manual caso a caso",
          ],
        },
        {
          id: "confirmacion_coach",
          text: "¿Cómo prefiere confirmar los pagos recibidos?",
          type: "single",
          required: true,
          options: [
            "Revisión manual de cada comprobante",
            "Panel con listado pendientes / confirmados",
            "Notificación al recibir un comprobante",
            "Indiferente, siempre que sea ágil",
          ],
        },
        {
          id: "datos_bancarios",
          text: "¿Utiliza datos bancarios fijos para recibir transferencias?",
          type: "single",
          required: true,
          options: [
            "Sí, siempre los mismos",
            "Varían según el caso",
            "Cobra a nombre de otra persona o empresa",
          ],
        },
      ],
    },
    {
      id: "vision",
      label: "Alcance",
      title: "Prioridades y plazos",
      subtitle: "Definición del alcance del proyecto",
      questions: [
        {
          id: "prioridad",
          text: "¿Cuál es su prioridad principal en este momento?",
          type: "single",
          required: true,
          options: [
            "Ordenar cobros y control de pagos",
            "Web profesional (presencia digital)",
            "Venta y entrega de planificaciones online",
            "Escalar cantidad de alumnos con orden",
            "Todo lo anterior, implementado por fases",
          ],
        },
        {
          id: "herramientas",
          text: "¿Cuál es su nivel de comodidad con herramientas digitales?",
          type: "single",
          required: true,
          options: [
            "Prefiero interfaces simples (pocos pasos)",
            "Me adapto con orientación inicial",
            "Manejo con soltura apps, Excel, etc.",
          ],
        },
        {
          id: "plazo",
          text: "¿En qué plazo le gustaría contar con una solución operativa?",
          type: "single",
          required: true,
          options: [
            "Lo antes posible",
            "En 1–2 meses",
            "En 3–6 meses",
            "Sin urgencia, priorizar calidad",
          ],
        },
        {
          id: "comentario_final",
          text: "Comentarios adicionales (referentes, requisitos, observaciones)",
          type: "open",
          required: false,
          placeholder: "Información adicional relevante para el proyecto...",
        },
      ],
    },
  ],
};
