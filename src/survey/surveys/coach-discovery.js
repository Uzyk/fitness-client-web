/**
 * Encuesta: Discovery coach online (cobros + planificación)
 * Slug URL: ?s=coach-discovery  (default)
 */
export const coachDiscoverySurvey = {
  slug: "coach-discovery",
  badge: "DISCOVERY COACH",
  title: "Formulario de discovery",
  subtitle: "Coaching online · Cobros y planificación",

  intro: {
    icon: "📋",
    description: "Este formulario toma unos 8–10 minutos. Tus respuestas son confidenciales.",
    highlight:
      "Validemos la idea: desbloquear la planificación del alumno solo cuando suba el comprobante de transferencia y tú lo confirmes — para no perder cobros ni dar sesiones sin pagar.",
    bullets: [
      "Preguntas sobre cómo trabajas hoy",
      "Al final puedes enviar respuestas por WhatsApp",
      "También se guardan en nuestra base de datos",
    ],
    note: "No hay respuestas incorrectas.",
    startLabel: "Comenzar formulario →",
    footer: "Confidencial · Solo para planificar tu proyecto",
  },

  result: {
    message: "Tus respuestas nos ayudan a diseñar la mejor solución para tu coaching online.",
  },

  whatsapp: {
    enabled: true,
    recipient: import.meta.env.VITE_WHATSAPP_RECIPIENT || "56912345678",
  },

  sections: [
    {
      id: "perfil",
      label: "Perfil",
      title: "Cuéntame sobre ti",
      subtitle: "Para contextualizar tu negocio como coach",
      questions: [
        { id: "nombre", text: "¿Cómo te llamas?", type: "text", required: true, placeholder: "Tu nombre" },
        {
          id: "marca",
          text: "¿Nombre de tu marca o cómo te conocen tus alumnos?",
          type: "text",
          required: true,
          placeholder: "Ej: Coach María, Studio Fit...",
        },
        {
          id: "modalidad",
          text: "¿Cómo trabajas hoy con tus alumnos?",
          type: "multi",
          required: true,
          options: [
            "Presencial en gimnasio",
            "Presencial a domicilio",
            "Online (videollamada / seguimiento remoto)",
            "Solo envío planificaciones (sin sesión en vivo)",
            "Mix presencial + online",
          ],
        },
      ],
    },
    {
      id: "cobros",
      label: "Cobros",
      title: "Cómo cobras hoy",
      subtitle: "Queremos entender el problema con los pagos",
      questions: [
        {
          id: "metodo_pago",
          text: "¿Cómo te pagan tus alumnos normalmente?",
          type: "multi",
          required: true,
          options: ["Transferencia bancaria", "Efectivo", "Tarjeta / POS", "Otro medio digital"],
        },
        {
          id: "frecuencia_cobro",
          text: "¿Con qué frecuencia cobras?",
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
          text: "¿Qué problemas tienes con los cobros? (marca todo lo que te pase)",
          type: "multi",
          required: true,
          options: [
            "Se me olvida cobrar a tiempo",
            "A veces doy más sesiones de las que me pagaron",
            "No llevo un registro claro de quién pagó",
            "Los alumnos pagan tarde o a medias",
            "Pierdo tiempo persiguiendo comprobantes por WhatsApp",
            "No sé cuánto me deben en total",
            "Me cuesta cobrar / da vergüenza recordar el pago",
            "Otro",
          ],
        },
        {
          id: "registro_actual",
          text: "¿Cómo llevas el control de pagos hoy?",
          type: "single",
          required: true,
          options: [
            "Excel o Google Sheets",
            "Cuaderno / libreta",
            "Solo memoria y chats de WhatsApp",
            "App de entrenamiento",
            "No llevo registro",
            "Otro",
          ],
        },
        {
          id: "problema_cobro_detalle",
          text: "Describe con tus palabras el mayor dolor con los cobros",
          type: "open",
          required: false,
          placeholder: "Ej: Termino la semana y me doy cuenta que entrené a Juan 3 veces pero solo me transfirió 2...",
        },
      ],
    },
    {
      id: "planificacion",
      label: "Planificación",
      title: "Cómo entregas la planificación",
      subtitle: "Para diseñar el flujo de desbloqueo",
      questions: [
        {
          id: "entrega_plan",
          text: "¿Cómo entregas la planificación a tus alumnos?",
          type: "multi",
          required: true,
          options: [
            "WhatsApp (PDF, Excel, foto, texto)",
            "Email",
            "Presencial (en sesión)",
            "App (Hevy, TrueCoach, etc.)",
            "Google Drive / link compartido",
            "Aún no tengo un formato fijo",
          ],
        },
        {
          id: "alumnos_activos",
          text: "¿Cuántos alumnos activos tienes aproximadamente?",
          type: "single",
          required: true,
          options: ["1–5", "6–15", "16–30", "Más de 30"],
        },
        {
          id: "renovacion_plan",
          text: "¿Cada cuánto renuevas o actualizas la planificación?",
          type: "single",
          required: true,
          options: ["Cada sesión", "Semanal", "Cada 2–4 semanas", "Mensual", "Cuando el alumno lo pide"],
        },
        {
          id: "precio_referencia",
          text: "¿Cuánto cobras aproximadamente por sesión o plan? (opcional)",
          type: "text",
          required: false,
          placeholder: "Ej: $25.000 por sesión, $80.000 el mes...",
        },
      ],
    },
    {
      id: "propuesta",
      label: "Propuesta",
      title: "Desbloqueo con comprobante",
      subtitle: "Validemos la idea que conversamos",
      intro:
        "La idea: el alumno sube el comprobante de transferencia → tú lo confirmas → recién ahí se desbloquea su planificación. Así la sesión/plan queda pagada antes de entregarse.",
      questions: [
        {
          id: "idea_desbloqueo",
          text: "¿Te hace sentido este flujo para tu negocio?",
          type: "single",
          required: true,
          options: [
            "Sí, resolvería mi problema principal",
            "Sí, pero necesito ajustar algunas cosas",
            "Tal vez, tengo dudas",
            "No, prefiero otro enfoque",
          ],
        },
        {
          id: "ajustes_flujo",
          text: "Si lo usarías, ¿qué ajustarías o qué te preocupa?",
          type: "open",
          required: false,
          placeholder: "Ej: Algunos alumnos son de confianza, ¿podría desbloquear manualmente?",
        },
        {
          id: "sin_pago",
          text: "Si un alumno no ha pagado, ¿qué debería pasar?",
          type: "multi",
          required: true,
          options: [
            "No ve la planificación nueva (bloqueo total)",
            "Ve un mensaje tipo 'pendiente de pago'",
            "Recibe recordatorio automático por WhatsApp",
            "Igual puede entrenar presencial pero sin plan online",
            "Lo manejo caso a caso",
          ],
        },
        {
          id: "confirmacion_coach",
          text: "¿Cómo te gustaría confirmar los pagos?",
          type: "single",
          required: true,
          options: [
            "Yo reviso cada comprobante y confirmo manualmente",
            "Lista de pendientes / confirmados en una pantalla simple",
            "Notificación cuando un alumno sube comprobante",
            "Me da lo mismo mientras sea rápido",
          ],
        },
        {
          id: "datos_bancarios",
          text: "¿Usas siempre los mismos datos bancarios para recibir transferencias?",
          type: "single",
          required: true,
          options: [
            "Sí, siempre los mismos",
            "A veces cambian (distintas cuentas)",
            "Cobro a veces a otra persona / empresa",
          ],
        },
      ],
    },
    {
      id: "vision",
      label: "Visión",
      title: "Online y próximos pasos",
      subtitle: "Para definir el alcance del proyecto",
      questions: [
        {
          id: "prioridad",
          text: "¿Qué es lo más urgente para ti ahora?",
          type: "single",
          required: true,
          options: [
            "Ordenar cobros y no perder plata",
            "Tener una web profesional (link in bio)",
            "Vender / entregar planificaciones online",
            "Escalar y tener más alumnos sin caos",
            "Todo lo anterior, pero por fases",
          ],
        },
        {
          id: "herramientas",
          text: "¿Qué tan cómoda te sientes usando tecnología?",
          type: "single",
          required: true,
          options: [
            "Prefiero algo muy simple (pocos clics)",
            "Me adapto si me enseñan",
            "Me manejo bien con apps, Excel, etc.",
          ],
        },
        {
          id: "plazo",
          text: "¿Cuándo te gustaría empezar a usar algo así?",
          type: "single",
          required: true,
          options: ["Lo antes posible", "En 1–2 meses", "En 3–6 meses", "Sin prisa, primero definir bien"],
        },
        {
          id: "comentario_final",
          text: "¿Algo más que debamos saber? (miedos, ideas, referentes)",
          type: "open",
          required: false,
          placeholder: "Libre...",
        },
      ],
    },
    {
      id: "contacto",
      label: "Contacto",
      title: "Datos para seguir en contacto",
      subtitle: "Para coordinar la siguiente reunión",
      questions: [
        { id: "email", text: "Email", type: "email", required: true, placeholder: "tu@email.com" },
        { id: "telefono", text: "WhatsApp / teléfono", type: "tel", required: true, placeholder: "+56 9 ..." },
        {
          id: "horario",
          text: "¿Cuándo te queda mejor una llamada para revisar esto?",
          type: "text",
          required: false,
          placeholder: "Ej: Tardes entre semana, sábado AM...",
        },
      ],
    },
  ],
};
