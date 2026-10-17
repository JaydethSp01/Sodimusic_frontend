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
  V,
  WaLink,
  formatPhone,
  fullAddress,
  responsibleName,
  type LegalDocProps,
} from "./shared";

const TOC = [
  { id: "responsable", label: "Responsable del tratamiento" },
  { id: "datos", label: "Qué datos recogemos" },
  { id: "finalidades", label: "Para qué los usamos" },
  { id: "base-legal", label: "Base legal: tu autorización" },
  { id: "derechos", label: "Tus derechos" },
  { id: "consultas", label: "Consultas y reclamos" },
  { id: "transferencias", label: "Proveedores y transferencia internacional" },
  { id: "menores", label: "Menores de edad" },
  { id: "conservacion", label: "Cuánto tiempo conservamos los datos" },
  { id: "comerciales", label: "Comunicaciones comerciales" },
  { id: "cookies", label: "Cookies y almacenamiento local" },
  { id: "seguridad", label: "Seguridad" },
  { id: "vigencia", label: "Vigencia y cambios" },
];

export const PRIVACY_TITLE = "Política de tratamiento de datos personales";
export const PRIVACY_DESCRIPTION =
  "Cómo recogemos, usamos y protegemos tus datos personales en Sodimusic: finalidades, derechos del titular, canales de consulta y reclamo, cookies y proveedores.";

export function PrivacyPolicy({ legal, siteUrl, isAdmin }: LegalDocProps) {
  const name = responsibleName(legal);
  return (
    <>
      <p className="lead">
        Esta política explica qué datos personales recoge <strong>{legal.businessName}</strong> a través de{" "}
        <a href={siteUrl}>{siteUrl.replace(/^https?:\/\//, "")}</a> y de sus canales de contacto, para qué los usa, con
        quién los comparte y cómo puedes ejercer tus derechos. Está redactada conforme a la Ley 1581 de 2012, el Decreto 1377
        de 2013 (compilado en el Decreto 1074 de 2015) y las guías de la Superintendencia de Industria y Comercio (SIC).
      </p>

      <Toc items={TOC} />

      <Section n={1} id="responsable" title="Responsable del tratamiento">
        <p>El responsable del tratamiento de tus datos personales es:</p>
        <IdList>
          <Line label="Nombre comercial" value={legal.businessName} isAdmin={isAdmin} />
          <Line label="Razón social / titular" value={legal.legalName} isAdmin={isAdmin} what="razón social" />
          <Line label="NIT" value={legal.nit} isAdmin={isAdmin} />
          <Line label="Dirección" value={fullAddress(legal)} isAdmin={isAdmin} what="dirección" />
          <Line label="Correo para datos personales" value={legal.email} isAdmin={isAdmin} href={legal.email ? `mailto:${legal.email}` : undefined} what="correo PQR" />
          <Line
            label="WhatsApp"
            value={legal.phone ? formatPhone(legal.phone) : ""}
            isAdmin={isAdmin}
            href={legal.phone ? `https://wa.me/${legal.phone}` : undefined}
          />
          <Line label="Horario de atención" value={legal.hours} isAdmin={isAdmin} />
        </IdList>
        <p>
          Cuando en este documento decimos «nosotros» nos referimos a {name}. Si contratas una sesión de estudio, una licencia
          de beat o un producto de la tienda, el tratamiento de tus datos se rige también por los términos de cada servicio.
        </p>
      </Section>

      <Section n={2} id="datos" title="Qué datos recogemos">
        <p>Solo pedimos los datos necesarios para atender lo que nos solicitas. Según el formulario que uses:</p>
        <Sub n="2.1" title="Reserva de sesión de estudio" />
        <ul>
          <li>Nombre y nombre artístico.</li>
          <li>Correo electrónico y número de teléfono (WhatsApp).</li>
          <li>Usuario de Instagram (opcional).</li>
          <li>Referencia musical (enlace de Spotify, YouTube o SoundCloud) y la visión de tu proyecto que nos cuentes.</li>
          <li>Servicio, género, fecha y hora solicitadas.</li>
          <li>Si eres mayor de 18 años (ver sección 8).</li>
        </ul>
        <Sub n="2.2" title="Interés en un beat" />
        <ul>
          <li>Nombre artístico, correo, teléfono e Instagram (opcional).</li>
          <li>Beat de interés, tipo de licencia y el mensaje que nos escribas.</li>
        </ul>
        <Sub n="2.3" title="Contacto, prensa y demos" />
        <ul>
          <li>Nombre, correo, teléfono (opcional), asunto y mensaje.</li>
        </ul>
        <Sub n="2.4" title="Boletín (newsletter)" />
        <ul>
          <li>Correo electrónico y, si lo indicas, tu nombre.</li>
        </ul>
        <Sub n="2.5" title="Pedidos de la tienda" />
        <p>
          El pedido se cierra por WhatsApp. Los datos que nos envíes por ese canal (nombre, dirección de entrega, comprobante de
          pago) se usan únicamente para preparar, facturar y entregar tu pedido.
        </p>
        <Sub n="2.6" title="Datos que no pedimos" />
        <p>
          No solicitamos datos sensibles (salud, origen étnico, creencias, datos biométricos) ni datos de tarjetas de pago: los
          pagos se hacen por transferencia, Nequi o el medio que acordemos, siempre fuera de este sitio.
        </p>
      </Section>

      <Section n={3} id="finalidades" title="Para qué los usamos">
        <p>Tratamos tus datos para las siguientes finalidades:</p>
        <ol>
          <li>Gestionar, confirmar y prestar el servicio que solicitas (sesión, beat, pedido, respuesta a tu mensaje).</li>
          <li>Comunicarnos contigo por correo o WhatsApp sobre esa solicitud.</li>
          <li>Emitir documentos de venta y cumplir obligaciones contables y tributarias.</li>
          <li>Atender tus consultas, quejas y reclamos.</li>
          <li>
            Solo si lo autorizas expresamente: enviarte novedades, lanzamientos y promociones del sello (ver sección 10).
          </li>
          <li>Llevar métricas agregadas de uso del sitio (sin identificarte, ver sección 11).</li>
        </ol>
        <p>No vendemos ni alquilamos tus datos a terceros.</p>
      </Section>

      <Section n={4} id="base-legal" title="Base legal: tu autorización">
        <p>
          Tratamos tus datos con tu <strong>autorización previa, expresa e informada</strong>, que nos das al marcar la casilla
          «Autorizo a {legal.businessName} el tratamiento de mis datos personales» en cada formulario. La casilla nunca viene
          marcada por defecto. Guardamos la fecha de tu autorización y la versión de esta política vigente en ese momento como
          prueba de tu consentimiento (artículo 9 de la Ley 1581 de 2012 y artículos 2.2.2.25.2.2 a 2.2.2.25.2.5 del Decreto
          1074 de 2015).
        </p>
        <p>
          Cuando nos escribes directamente por WhatsApp o correo, entendemos que autorizas el uso de los datos que nos envías
          para responderte y atender tu solicitud.
        </p>
      </Section>

      <Section n={5} id="derechos" title="Tus derechos como titular">
        <p>De acuerdo con el artículo 8 de la Ley 1581 de 2012, tienes derecho a:</p>
        <ul>
          <li>
            <strong>Conocer</strong> qué datos tuyos tenemos y cómo los hemos usado.
          </li>
          <li>
            <strong>Actualizar y rectificar</strong> los datos incompletos, inexactos o desactualizados.
          </li>
          <li>
            <strong>Suprimir</strong> tus datos cuando no exista un deber legal o contractual que nos obligue a conservarlos.
          </li>
          <li>
            <strong>Revocar</strong> la autorización en cualquier momento, sin que ello afecte lo ya ejecutado.
          </li>
          <li>Solicitar prueba de la autorización que nos diste.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
          <li>Acceder de forma gratuita a tus datos.</li>
        </ul>
      </Section>

      <Section n={6} id="consultas" title="Consultas y reclamos">
        <p>
          El canal para ejercer tus derechos es el correo <MailLink legal={legal} isAdmin={isAdmin} /> con el asunto «Datos
          personales», o el WhatsApp <WaLink legal={legal} isAdmin={isAdmin} />. Indica tu nombre, el dato o formulario al que
          se refiere tu solicitud y qué necesitas (conocer, actualizar, suprimir, revocar).
        </p>
        <Sub n="6.1" title="Consultas" />
        <p>
          Respondemos en un máximo de <strong>diez (10) días hábiles</strong> desde que recibimos la consulta. Si no es
          posible, te avisaremos antes de que venza ese plazo y responderemos en los cinco (5) días hábiles siguientes.
        </p>
        <Sub n="6.2" title="Reclamos" />
        <p>
          Si consideras que tus datos deben corregirse, actualizarse o suprimirse, o que hemos incumplido la ley, envíanos un
          reclamo con la descripción de los hechos. Si está incompleto, te pediremos completarlo en cinco (5) días; si pasan
          dos (2) meses sin respuesta, entenderemos que desistes. Resolvemos el reclamo en un máximo de{" "}
          <strong>quince (15) días hábiles</strong>; si necesitamos más tiempo te avisaremos y responderemos en los ocho (8)
          días hábiles siguientes.
        </p>
        <p>
          Solo puedes acudir a la SIC (<Ext href={SIC_URL}>sic.gov.co</Ext>) después de haber presentado la consulta o el
          reclamo ante nosotros.
        </p>
      </Section>

      <Section n={7} id="transferencias" title="Proveedores y transferencia internacional">
        <p>
          Para operar el sitio usamos proveedores tecnológicos que actúan como encargados del tratamiento y que pueden
          alojar datos fuera de Colombia, principalmente en Estados Unidos. Todos ofrecen garantías contractuales de seguridad y
          confidencialidad:
        </p>
        <ul>
          <li>
            <strong>Supabase (sobre AWS, EE. UU.)</strong>: base de datos donde se guardan las solicitudes, intereses en beats,
            mensajes y suscripciones.
          </li>
          <li>
            <strong>Vercel</strong>: alojamiento del sitio web y almacenamiento de archivos subidos desde el panel.
          </li>
          <li>
            <strong>Resend</strong>: envío de correos de confirmación y notificaciones.
          </li>
          <li>
            <strong>Meta Platforms (WhatsApp)</strong>: cuando decides escribirnos por WhatsApp, la conversación se rige también
            por las condiciones y la política de privacidad de WhatsApp.
          </li>
        </ul>
        <p>
          Al autorizar el tratamiento aceptas esta transferencia internacional, que se hace únicamente para las finalidades de la
          sección 3 (artículo 26 de la Ley 1581 de 2012).
        </p>
      </Section>

      <Section n={8} id="menores" title="Menores de edad">
        <p>
          Nuestros servicios están dirigidos a mayores de 18 años. Si eres menor y quieres grabar en el estudio, un padre,
          madre o acudiente debe autorizar por escrito la sesión y el tratamiento de tus datos, y acompañarte durante la grabación.
          En el formulario de reserva te preguntamos si eres mayor de edad para gestionarlo. Tratamos los datos de menores
          respetando su interés superior y sus derechos fundamentales (artículo 7 de la Ley 1581 de 2012). Si detectamos datos de
          un menor sin esa autorización, los eliminaremos.
        </p>
      </Section>

      <Section n={9} id="conservacion" title="Cuánto tiempo conservamos los datos">
        <ul>
          <li>
            <strong>Solicitudes de sesión, intereses en beats y mensajes</strong>: mientras dure la relación contigo y hasta tres
            (3) años después de la última interacción, para atender garantías, reclamos y obligaciones legales.
          </li>
          <li>
            <strong>Documentos de venta y soportes contables</strong>: el tiempo que exige la ley tributaria y comercial (como
            mínimo cinco años).
          </li>
          <li>
            <strong>Boletín</strong>: hasta que te des de baja. Al darte de baja conservamos solo tu correo en una lista de
            exclusión para no volver a escribirte.
          </li>
        </ul>
        <p>Cumplido el plazo, eliminamos o anonimizamos los datos.</p>
      </Section>

      <Section n={10} id="comerciales" title="Comunicaciones comerciales">
        <p>
          Solo te enviamos novedades, lanzamientos o promociones si marcaste la casilla opcional de marketing o te suscribiste
          al boletín (<strong>opt-in</strong>). Nunca lo damos por hecho.
        </p>
        <p>
          Cumplimos la Ley 2300 de 2023: te contactamos con fines comerciales únicamente de lunes a viernes entre 7:00 a. m. y
          7:00 p. m. y los sábados entre 8:00 a. m. y 3:00 p. m., nunca domingos ni festivos, y como máximo una vez por semana
          por canal. Las comunicaciones relacionadas con una sesión, un pedido o una solicitud tuya no son comerciales y se
          envían cuando sea necesario para atenderte.
        </p>
        <p>
          Puedes darte de baja en cualquier momento con el enlace que incluye cada correo, respondiendo «BAJA» por WhatsApp o
          escribiendo a <MailLink legal={legal} isAdmin={isAdmin} />. La baja se aplica de inmediato.
        </p>
      </Section>

      <Section n={11} id="cookies" title="Cookies y almacenamiento local">
        <p>
          Este sitio no usa cookies de publicidad ni de rastreo de terceros, por eso no verás un banner de cookies. Usamos
          únicamente lo necesario para que funcione:
        </p>
        <ul>
          <li>
            <strong>Cookie de sesión del panel de administración</strong>: solo para el equipo de Sodimusic que inicia sesión en{" "}
            <code>/admin</code>.
          </li>
          <li>
            <strong>Cookie <code>site_preview</code></strong>: permite al equipo ver un borrador del sitio antes de publicarlo.
            Nunca se crea para visitantes.
          </li>
          <li>
            <strong>Carrito de la tienda</strong>: se guarda en el almacenamiento local de tu navegador (<code>localStorage</code>)
            para que no pierdas tu pedido al cambiar de página. No sale de tu dispositivo hasta que decides enviarlo por WhatsApp.
          </li>
          <li>
            <strong>Métricas de visitas</strong>: contamos las páginas vistas de forma agregada, sin guardar tu dirección IP ni
            identificadores que permitan reconocerte.
          </li>
        </ul>
        <p>
          Los videos de YouTube se incrustan solo cuando haces clic en ellos y a través de <code>youtube-nocookie.com</code>;
          al reproducirlos aplican las condiciones de Google.
        </p>
      </Section>

      <Section n={12} id="seguridad" title="Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: conexiones cifradas (HTTPS), acceso al
          panel protegido con usuario y contraseña, bases de datos con control de acceso y proveedores con certificaciones de
          seguridad. Ningún sistema es infalible; si ocurre un incidente que afecte tus datos te lo comunicaremos y lo
          reportaremos a la SIC conforme a la ley.
        </p>
      </Section>

      <Section n={13} id="vigencia" title="Vigencia y cambios">
        <p>
          Esta política rige desde la fecha de su versión indicada al inicio y al final del documento, y las bases de datos se
          conservarán por los plazos de la sección 9. Si hacemos cambios sustanciales los publicaremos en esta misma página con
          una nueva fecha de versión y, cuando la ley lo exija, te pediremos de nuevo tu autorización. Te recomendamos revisarla
          cada vez que nos envíes un formulario.
        </p>
        <p>
          Normativa aplicable: Ley 1581 de 2012, Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015), Ley 1266 de 2008
          en lo pertinente, Ley 2300 de 2023 y las circulares de la Superintendencia de Industria y Comercio.
        </p>
      </Section>

      <DocFooter version={legal.policyVersion} note={<>Responsable: <V value={name} isAdmin={isAdmin} what="razón social" />
          {legal.nit ? ` · NIT ${legal.nit}` : null}</>} />
    </>
  );
}
