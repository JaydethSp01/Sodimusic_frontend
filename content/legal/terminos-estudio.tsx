import Link from "next/link";
import {
  DocFooter,
  Ext,
  IdList,
  Line,
  MailLink,
  SIC_URL,
  Section,
  Sub,
  Toc,
  WaLink,
  formatPhone,
  fullAddress,
  hasValue,
  responsibleName,
  type LegalDocProps,
} from "./shared";

const TOC = [
  { id: "prestador", label: "Quién presta el servicio" },
  { id: "reserva", label: "Reserva y confirmación" },
  { id: "anticipo", label: "Anticipo y pago" },
  { id: "cancelacion", label: "Cancelación, reprogramación y no-show" },
  { id: "puntualidad", label: "Puntualidad y duración" },
  { id: "menores", label: "Menores de edad" },
  { id: "conducta", label: "Conducta en el estudio" },
  { id: "titularidad", label: "Titularidad de la grabación y del master" },
  { id: "creditos", label: "Créditos" },
  { id: "promocion", label: "Uso promocional de la sesión" },
  { id: "entrega", label: "Entrega de archivos" },
  { id: "responsabilidad", label: "Responsabilidad" },
  { id: "pqr", label: "PQR y ley aplicable" },
];

export const STUDIO_TERMS_TITLE = "Términos del estudio y servicios de producción";
export const STUDIO_TERMS_DESCRIPTION =
  "Condiciones para grabar y producir con Sodimusic: reserva, anticipo, cancelaciones, menores de edad, titularidad del master, créditos y entrega de archivos.";

export function StudioTerms({ legal, siteUrl, isAdmin }: LegalDocProps) {
  const name = responsibleName(legal);
  const deposit = Number.isFinite(legal.depositPercent) ? Math.max(0, Math.min(100, legal.depositPercent)) : 0;
  const hours = Number.isFinite(legal.cancellationHours) && legal.cancellationHours > 0 ? legal.cancellationHours : 24;
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <p className="lead">
        Estos términos aplican a las sesiones de grabación, producción de beats, coproducción, mezcla y masterización,
        producción audiovisual y consultoría que contratas con <strong>{legal.businessName}</strong> a través de{" "}
        <a href={`${siteUrl}/booking`}>{host}/booking</a> o por WhatsApp. Al enviar una solicitud de sesión los aceptas.
      </p>

      <Toc items={TOC} />

      <Section n={1} id="prestador" title="Quién presta el servicio">
        <IdList>
          <Line label="Nombre comercial" value={legal.businessName} isAdmin={isAdmin} />
          <Line label="Razón social / titular" value={legal.legalName} isAdmin={isAdmin} what="razón social" />
          <Line label="NIT" value={legal.nit} isAdmin={isAdmin} />
          <Line label="Estudio" value={fullAddress(legal)} isAdmin={isAdmin} what="dirección" />
          <Line label="Correo" value={legal.email} isAdmin={isAdmin} href={legal.email ? `mailto:${legal.email}` : undefined} what="correo PQR" />
          <Line
            label="WhatsApp"
            value={legal.phone ? formatPhone(legal.phone) : ""}
            isAdmin={isAdmin}
            href={legal.phone ? `https://wa.me/${legal.phone}` : undefined}
          />
          <Line label="Horario" value={legal.hours} isAdmin={isAdmin} />
        </IdList>
      </Section>

      <Section n={2} id="reserva" title="Reserva y confirmación">
        <ol>
          <li>
            Envías la solicitud desde la web (servicio, referencia musical, fecha y hora, datos de contacto) o por WhatsApp.
            La solicitud <strong>no reserva</strong> el espacio por sí sola.
          </li>
          <li>
            Revisamos la disponibilidad y te respondemos por WhatsApp o correo con el precio, la duración estimada y el valor del
            anticipo.
          </li>
          <li>
            La sesión queda <strong>confirmada</strong> cuando recibimos el anticipo y te enviamos la confirmación escrita con
            fecha y hora. Hasta entonces el horario puede asignarse a otra persona.
          </li>
        </ol>
        <p>
          Los precios publicados en la web son valores «desde», en pesos colombianos
          {legal.ivaIncluded ? " con IVA incluido cuando aplica" : ""}; el precio final depende del alcance de cada proyecto y se
          acuerda por escrito antes de confirmar.
        </p>
      </Section>

      <Section n={3} id="anticipo" title="Anticipo y pago">
        <p>
          Para confirmar la sesión se paga un anticipo del <strong>{deposit}%</strong> del valor acordado, por transferencia
          o Nequi, dentro de las cuarenta y ocho (48) horas siguientes a nuestra respuesta (o antes si la sesión es más
          próxima). El saldo se paga el día de la sesión, antes de iniciar, salvo acuerdo escrito distinto.
        </p>
        <p>
          En proyectos por etapas (producción de beat, mezcla y master, video) el pago puede dividirse por entregables; cada
          etapa se libera con su pago. Los archivos finales se entregan con el <strong>pago total</strong>.
        </p>
      </Section>

      <Section n={4} id="cancelacion" title="Cancelación, reprogramación y no-show">
        <Sub n="4.1" title="Por parte del cliente" />
        <ul>
          <li>
            Puedes <strong>reprogramar</strong> sin costo una (1) vez avisando con al menos <strong>{hours} horas</strong> de
            anticipación, sujeto a disponibilidad.
          </li>
          <li>
            Si <strong>cancelas</strong> con {hours} horas o más de anticipación, el anticipo queda como saldo a favor para una
            nueva sesión dentro de los tres (3) meses siguientes, o se devuelve descontando los costos ya causados (por ejemplo,
            músicos o equipos contratados para tu sesión).
          </li>
          <li>
            Si cancelas con <strong>menos de {hours} horas</strong>, el anticipo cubre el tiempo reservado y no se devuelve.
          </li>
          <li>
            <strong>No presentarse</strong> (no-show) sin aviso equivale a una cancelación tardía: se pierde el anticipo y la
            sesión se da por prestada.
          </li>
        </ul>
        <Sub n="4.2" title="Por parte del estudio" />
        <p>
          Si por fuerza mayor, enfermedad o falla técnica no podemos atenderte, te avisaremos lo antes posible y podrás elegir
          entre reprogramar sin costo o recibir la devolución total del anticipo en un máximo de quince (15) días calendario.
        </p>
      </Section>

      <Section n={5} id="puntualidad" title="Puntualidad y duración">
        <p>
          La sesión empieza a la hora confirmada. El tiempo de llegada tarde se descuenta de la sesión, porque el horario
          siguiente puede estar reservado. Si llegas más de treinta (30) minutos tarde sin aviso se considera no-show. Las
          horas adicionales se cobran según la tarifa acordada y dependen de la disponibilidad.
        </p>
        <p>
          Llega con tus letras listas, tus referencias y, si aplica, tus pistas en el formato acordado. El tiempo de sesión incluye
          montaje, grabación y revisión; la edición y la mezcla se cotizan como servicio aparte salvo que estén incluidas en el
          paquete.
        </p>
      </Section>

      <Section n={6} id="menores" title="Menores de edad">
        <p>
          Si el artista es menor de 18 años, la sesión debe ser contratada por su padre, madre o acudiente, quien debe{" "}
          <strong>autorizar por escrito</strong> la sesión y el tratamiento de los datos del menor, y{" "}
          <strong>acompañarlo durante toda la grabación</strong>. En el formulario te preguntamos si eres mayor de edad para
          coordinar esta autorización antes de confirmar. Sin la autorización y el acompañamiento no se inicia la sesión y
          aplica la política de cancelación.
        </p>
      </Section>

      <Section n={7} id="conducta" title="Conducta en el estudio">
        <ul>
          <li>Máximo de acompañantes: el que acordemos al confirmar (por defecto dos personas además del artista).</li>
          <li>No se permite fumar ni consumir alcohol o sustancias dentro del estudio. No se atiende a personas en estado de embriaguez.</li>
          <li>Cuida los equipos; los daños causados por descuido o mal uso se cobran a precio de reposición o reparación.</li>
          <li>Respeto hacia el equipo del estudio y los demás artistas. Nos reservamos el derecho de terminar la sesión por conductas agresivas, sin devolución.</li>
          <li>Está prohibido grabar o fotografiar el estudio y a otras personas sin permiso.</li>
        </ul>
      </Section>

      <Section n={8} id="titularidad" title="Titularidad de la grabación y del master">
        <p>
          Lo que acordemos <strong>por escrito</strong> (contrato, cotización aceptada o chat de WhatsApp) prevalece. Si no hay
          acuerdo específico, aplica lo siguiente, conforme a la Ley 23 de 1982 y la Decisión Andina 351 de 1993:
        </p>
        <ul>
          <li>
            <strong>Tu interpretación y tu letra son tuyas.</strong> El artista conserva los derechos sobre su interpretación y
            sobre la obra (letra y melodía) que haya creado.
          </li>
          <li>
            <strong>La producción es del estudio hasta el pago total.</strong> Los beats, arreglos, grabación, edición, mezcla y
            master realizados por Sodimusic son de titularidad del estudio (productor fonográfico) mientras exista saldo
            pendiente. Con el pago total te cedemos o licenciamos los derechos sobre la producción en los términos acordados
            (licencia no exclusiva, exclusiva o cesión), según el servicio contratado.
          </li>
          <li>
            Si grabas sobre un beat del catálogo, aplica además la <Link href="/legal/licencia-beats">Licencia de beats</Link>.
          </li>
          <li>
            Los archivos de sesión (multipistas, proyectos) permanecen en el estudio; los entregamos solo si lo pactamos y
            siempre después del pago total.
          </li>
        </ul>
        <p>
          Eres responsable de contar con los derechos sobre cualquier material de terceros que traigas (samples, pistas,
          voces) y nos mantendrás indemnes frente a reclamaciones por ese material.
        </p>
      </Section>

      <Section n={9} id="creditos" title="Créditos">
        <p>
          En toda publicación, distribución digital, video o pieza promocional de una canción producida, grabada, mezclada o
          masterizada por nosotros debe aparecer el crédito correspondiente: <strong>«Prod. by Sodimusic»</strong> o{" "}
          <strong>«Prod. by JeiVy LaZy»</strong> para producción, y «Mezcla y master: Sodimusic» cuando aplique. El crédito se
          incluye en los metadatos de la distribución (compositor/productor) y en la descripción de los videos.
        </p>
      </Section>

      <Section n={10} id="promocion" title="Uso promocional de la sesión">
        <p>
          Solo con tu <strong>autorización expresa</strong> (que te pediremos al confirmar o el día de la sesión) podremos usar
          fotos, clips o el nombre de tu proyecto en nuestras redes y portafolio. Puedes negarte sin que afecte el servicio, y
          revocar la autorización escribiéndonos; retiraremos el material en un plazo razonable. Nunca publicaremos canciones o
          adelantos antes de su lanzamiento sin tu consentimiento.
        </p>
      </Section>

      <Section n={11} id="entrega" title="Entrega de archivos y plazos">
        <ul>
          <li>
            <strong>Grabación vocal</strong>: pistas editadas en WAV dentro de los cinco (5) días hábiles siguientes a la
            sesión, salvo que se contrate mezcla.
          </li>
          <li>
            <strong>Mezcla y master</strong>: primera versión en siete (7) a diez (10) días hábiles desde que recibimos todos los
            archivos. Incluye hasta dos (2) rondas de ajustes; las adicionales se cotizan aparte.
          </li>
          <li>
            <strong>Beat personalizado</strong>: boceto en cinco (5) días hábiles y versión final tras tu aprobación, con hasta
            dos (2) rondas de cambios.
          </li>
          <li>
            <strong>Producción audiovisual</strong>: plazos y entregables según la cotización del proyecto.
          </li>
        </ul>
        <p>
          Los archivos se entregan por enlace de descarga (WAV 24 bit y MP3 320 kbps para masters; stems o multipistas solo si
          se pactaron). Conservamos los proyectos durante seis (6) meses después de la entrega; pasado ese tiempo podemos
          eliminarlos. Guarda tus copias.
        </p>
      </Section>

      <Section n={12} id="responsabilidad" title="Responsabilidad">
        <p>
          Respondemos por la calidad técnica del servicio contratado conforme a la garantía legal de la Ley 1480 de 2011. No
          garantizamos resultados comerciales (reproducciones, ventas, contratos) ni respondemos por el contenido de las letras
          ni por el uso que hagas de las grabaciones. Nuestra responsabilidad frente al cliente se limita al valor pagado por el
          servicio en cuestión, salvo dolo o culpa grave.
        </p>
      </Section>

      <Section n={13} id="pqr" title="PQR y ley aplicable">
        <p>
          Peticiones, quejas y reclamos: <MailLink legal={legal} isAdmin={isAdmin} /> o WhatsApp{" "}
          <WaLink legal={legal} isAdmin={isAdmin} />
          {hasValue(legal.hours) ? <> ({legal.hours})</> : null}. Respondemos en máximo quince (15) días hábiles. Si no quedas
          conforme puedes acudir a la Superintendencia de Industria y Comercio (<Ext href={SIC_URL}>www.sic.gov.co</Ext>).
        </p>
        <p>
          Estos términos se rigen por las leyes de Colombia (Ley 1480 de 2011, Ley 23 de 1982, Ley 527 de 1999 y normas
          concordantes). Tus datos se tratan según la <Link href="/legal/privacidad">Política de tratamiento de datos personales</Link>.
        </p>
      </Section>

      <DocFooter version={legal.termsVersion} note={<>Prestador: {name}{legal.nit ? ` · NIT ${legal.nit}` : ""}</>} />
    </>
  );
}
