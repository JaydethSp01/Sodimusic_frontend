/**
 * Preguntas frecuentes de reserva, beats y tienda.
 *
 * Las respuestas resumen las condiciones de `content/legal/*` y `features/beats/licenses.ts`;
 * si cambian allí, actualiza aquí. Texto plano (sin JSX) porque alimenta también el JSON-LD FAQPage.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BookingFaqOptions {
  /** Porcentaje del anticipo para confirmar la sesión (site.legal.depositPercent). */
  depositPercent?: number;
  /** Horas mínimas de aviso para reprogramar o cancelar sin perder el anticipo (site.legal.cancellationHours). */
  cancellationHours?: number;
}

/** FAQ de /booking con los valores configurados en el CMS (30 % y 24 h por defecto). */
export function bookingFaq({ depositPercent = 30, cancellationHours = 24 }: BookingFaqOptions = {}): FaqItem[] {
  const pct = Number.isFinite(depositPercent) ? Math.max(0, Math.min(100, Math.round(depositPercent))) : 30;
  const hours = Number.isFinite(cancellationHours) && cancellationHours > 0 ? Math.round(cancellationHours) : 24;
  return [
    {
      question: "¿Cómo reservo una sesión?",
      answer:
        "Envías la solicitud desde esta página (servicio, referencia musical, fecha y hora, datos de contacto) o por WhatsApp. Te respondemos con la disponibilidad y el valor; la fecha queda confirmada cuando recibimos el anticipo. Hasta entonces el horario puede asignarse a otra persona.",
    },
    {
      question: "¿Cuánto es el anticipo y cómo lo pago?",
      answer: `Para confirmar la sesión se paga un anticipo del ${pct} % del valor acordado, por transferencia o Nequi, dentro de las 48 horas siguientes a nuestra respuesta (o antes si la sesión está más cerca). Los datos de la cuenta siempre te los enviamos desde nuestro WhatsApp oficial. El saldo se paga el día de la sesión, antes de empezar, salvo acuerdo escrito distinto. Los valores se cotizan en pesos colombianos e incluyen el IVA cuando aplica.`,
    },
    {
      question: "¿Puedo cancelar o reprogramar?",
      answer: `Puedes reprogramar sin costo una vez avisando con al menos ${hours} horas de anticipación. Si cancelas con ${hours} horas o más, el anticipo queda como saldo a favor para una nueva fecha. Si cancelas con menos de ${hours} horas o no te presentas, el anticipo cubre el tiempo reservado y no se devuelve. Si somos nosotros quienes cancelamos, eliges entre reprogramar sin costo o recibir la devolución total del anticipo.`,
    },
    {
      question: "¿Qué pasa si llego tarde?",
      answer:
        "La sesión empieza a la hora confirmada y el tiempo de llegada tarde se descuenta de la sesión, porque el horario siguiente puede estar reservado. Si necesitas más tiempo, las horas adicionales se cobran según la tarifa acordada y dependen de la disponibilidad.",
    },
    {
      question: "¿De quién son la grabación y el master?",
      answer:
        "Tu letra y tu interpretación son tuyas. La producción (beat, arreglos, grabación, mezcla y master) es del estudio hasta el pago total; con el pago te cedemos o licenciamos los derechos en los términos acordados según el servicio. Si grabas sobre un beat del catálogo aplica además la Licencia de beats. En toda publicación debe ir el crédito «Prod. by Sodimusic» o «Prod. by JeiVy LaZy».",
    },
    {
      question: "¿Cuándo y cómo recibo los archivos?",
      answer:
        "Los entregamos por enlace de descarga una vez hecho el pago total. Grabación vocal: pistas editadas en WAV dentro de los 5 días hábiles siguientes a la sesión, salvo que contrates mezcla. Mezcla y master: primera versión en 7 a 10 días hábiles desde que recibimos todos los archivos, con hasta 2 rondas de ajustes incluidas. Los masters van en WAV 24 bit y MP3 320 kbps.",
    },
  ];
}

export const BOOKING_FAQ: FaqItem[] = bookingFaq();

export const BEATS_FAQ: FaqItem[] = [
  {
    question: "¿Qué tipos de licencia hay?",
    answer:
      "Cada beat se ofrece en tres licencias no exclusivas (MP3, WAV y Stems), que se diferencian por el formato entregado y los límites de uso, y en una licencia exclusiva que se contrata aparte. El precio «desde» del catálogo corresponde a la licencia más básica disponible para ese beat. Las licencias no exclusivas permiten que el mismo beat se licencie a otros artistas.",
  },
  {
    question: "¿Qué incluye cada licencia?",
    answer:
      "MP3: archivo 320 kbps con tag, hasta 2.500 copias, 100.000 streams y 1 video no monetizado. WAV: WAV 24 bit sin tag más MP3, hasta 5.000 copias, 250.000 streams y 1 video monetizable. Stems: pistas separadas más WAV y MP3, hasta 10.000 copias, 500.000 streams, 2 videos monetizables y radio. Los límites son por una canción nueva; si la superas, puedes ampliar a la siguiente licencia pagando la diferencia mientras el beat siga disponible.",
  },
  {
    question: "¿Qué significa la licencia exclusiva?",
    answer:
      "Se formaliza con un contrato escrito y firmado por ambas partes, con precio acordado caso por caso. Una vez pagada, el beat se retira del catálogo y no se licencia a nadie más. Recibes stems, WAV y MP3 (y el proyecto si se pacta) y puedes explotar la canción sin límites de ventas, streams o videos, incluido el registro en Content ID con el reparto acordado en el contrato.",
  },
  {
    question: "¿Cómo compro un beat y cuándo lo recibo?",
    answer:
      "Elige la licencia en la tarjeta del beat y envíanos tu interés por WhatsApp. El pago se hace por transferencia o Nequi a la cuenta que te indicamos desde nuestro WhatsApp oficial. Una vez acreditado el pago te enviamos el enlace de descarga y la confirmación de licencia (beat, tipo de licencia, fecha y tu nombre). Los precios están en pesos colombianos e incluyen el IVA cuando aplica.",
  },
  {
    question: "¿Puedo devolver un beat después de comprarlo?",
    answer:
      "No. Es contenido digital y, con tu acuerdo, la entrega del archivo inicia la ejecución del contrato, por lo que no aplica el derecho de retracto una vez descargado (artículo 47 de la Ley 1480 de 2011). Antes de pagar puedes escuchar la vista previa completa en el catálogo y preguntarnos lo que necesites. Si el archivo llega defectuoso o distinto del licenciado, lo reemplazamos sin costo por garantía legal.",
  },
  {
    question: "¿Qué crédito debo poner y qué no puedo hacer?",
    answer:
      "En todas las licencias debes incluir «Prod. by Sodimusic / JeiVy LaZy» en el título o descripción de los videos, en los metadatos de distribución y en tus redes. Con una licencia no exclusiva no puedes revender ni ceder el beat, usarlo en más de una canción, publicarlo solo como instrumental ni registrarlo en Content ID como obra enteramente tuya. Salvo acuerdo escrito distinto, el productor conserva el 50 % de la composición de la canción resultante.",
  },
];

export const SHOP_FAQ: FaqItem[] = [
  {
    question: "¿Cómo hago un pedido?",
    answer:
      "Añade los productos que quieras y pulsa «Pedir por WhatsApp»: se abre un chat con el detalle del pedido. Por ese mismo chat te confirmamos la disponibilidad, el costo del envío a tu ciudad y el total a pagar. El pedido queda cerrado cuando confirmamos por escrito.",
  },
  {
    question: "¿Cómo pago y cuándo despachan?",
    answer:
      "Aceptamos transferencia bancaria y Nequi, además de los medios que acordemos por WhatsApp. Los datos de la cuenta siempre te los enviamos desde nuestro WhatsApp oficial. Despachamos dentro de los 3 días hábiles siguientes a la confirmación del pago; si en 7 días calendario no recibimos el pago, el pedido se entiende cancelado. Los precios están en pesos colombianos e incluyen el IVA; el envío se cotiza aparte.",
  },
  {
    question: "¿Hacen envíos a mi ciudad?",
    answer:
      "Sí, enviamos a toda Colombia por transportadora. El costo depende del destino y del peso, y te lo cotizamos por WhatsApp antes de confirmar. La entrega suele tardar entre 2 y 8 días hábiles según la ciudad, y te enviamos el número de guía para que hagas seguimiento. También puedes recoger tu pedido sin costo en nuestra dirección, previa coordinación.",
  },
  {
    question: "¿Puedo devolver un producto si me arrepiento?",
    answer:
      "Sí. Por ser una venta no presencial tienes derecho de retracto dentro de los 5 días hábiles siguientes a la entrega, sin justificarlo (artículo 47 de la Ley 1480 de 2011). Escríbenos por WhatsApp o correo, devuelve el producto sin uso, con etiquetas y empaque, y te reembolsamos el valor del producto dentro de los 15 días calendario siguientes a recibirlo. El transporte de la devolución corre por tu cuenta. No aplica a productos personalizados ni a prendas de uso personal que por higiene no pueden devolverse una vez abiertas.",
  },
  {
    question: "¿Qué pasa si el producto llega defectuoso?",
    answer:
      "Todos los productos tienen la garantía legal de calidad e idoneidad de la Ley 1480 de 2011: salvo indicación distinta en la ficha, un año para productos nuevos. Escríbenos por WhatsApp o al correo de PQR y gestionamos la reparación, el cambio por uno igual o la devolución del dinero en los plazos que fija la ley. El transporte para hacer efectiva la garantía lo asumimos nosotros.",
  },
  {
    question: "¿Puedo cambiar la talla?",
    answer:
      "Sí. Además del retracto, aceptamos cambios de talla dentro de los 8 días calendario siguientes a la entrega, siempre que la prenda esté sin uso y con etiquetas. El transporte de ida y vuelta por cambio de talla lo asume el comprador. Revisa la guía de tallas de cada producto antes de pedir y, si tienes dudas, pregúntanos por WhatsApp.",
  },
];
