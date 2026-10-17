import Link from "next/link";
import {
  DocFooter,
  Ext,
  IdList,
  Line,
  LicenseTable,
  MailLink,
  SIC_URL,
  Section,
  Sub,
  Toc,
  WaLink,
  formatPhone,
  responsibleName,
  type LegalDocProps,
} from "./shared";

const TOC = [
  { id: "licenciante", label: "Quién licencia" },
  { id: "tipos", label: "Tipos de licencia" },
  { id: "no-exclusiva", label: "Licencia no exclusiva (MP3, WAV, Stems)" },
  { id: "exclusiva", label: "Licencia exclusiva" },
  { id: "obligaciones", label: "Obligaciones comunes" },
  { id: "entrega", label: "Entrega digital y retracto" },
  { id: "precios", label: "Precios, pago e IVA" },
  { id: "terminacion", label: "Incumplimiento y terminación" },
  { id: "ley", label: "Ley aplicable y conflictos" },
];

type Tier = { name: string; format: string; sales: string; streams: string; videos: string; shows: string };

const TIERS: Tier[] = [
  { name: "MP3", format: "MP3 320 kbps con tag", sales: "2.500 copias", streams: "100.000", videos: "1 video (no monetizado)", shows: "Sin límite, no pagados" },
  { name: "WAV", format: "WAV 24 bit sin tag + MP3", sales: "5.000 copias", streams: "250.000", videos: "1 video monetizable", shows: "Sin límite" },
  { name: "Stems", format: "Pistas separadas (stems) + WAV + MP3", sales: "10.000 copias", streams: "500.000", videos: "2 videos monetizables", shows: "Sin límite, incluye radio" },
];

export const BEATS_LICENSE_TITLE = "Licencia de uso de beats";
export const BEATS_LICENSE_DESCRIPTION =
  "Condiciones de las licencias no exclusivas (MP3, WAV, Stems) y exclusivas de los beats de Sodimusic: límites de uso, crédito obligatorio, Content ID, entrega digital y retracto.";

export function BeatsLicense({ legal, siteUrl, isAdmin }: LegalDocProps) {
  const name = responsibleName(legal);
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <p className="lead">
        Este documento regula el uso de los beats (pistas instrumentales) del catálogo de <strong>{legal.businessName}</strong>{" "}
        publicados en <a href={`${siteUrl}/beats`}>{host}/beats</a>. El productor conserva siempre la propiedad del beat; lo
        que adquieres es una <strong>licencia</strong> para usarlo dentro de los límites que se describen aquí. La licencia se
        perfecciona con el pago y la entrega del archivo, y forma parte de ella el mensaje de confirmación que te enviamos.
      </p>

      <Toc items={TOC} />

      <Section n={1} id="licenciante" title="Quién licencia">
        <IdList>
          <Line label="Productor / licenciante" value={legal.businessName} isAdmin={isAdmin} />
          <Line label="Razón social / titular" value={legal.legalName} isAdmin={isAdmin} what="razón social" />
          <Line label="NIT" value={legal.nit} isAdmin={isAdmin} />
          <Line label="Correo" value={legal.email} isAdmin={isAdmin} href={legal.email ? `mailto:${legal.email}` : undefined} what="correo PQR" />
          <Line
            label="WhatsApp"
            value={legal.phone ? formatPhone(legal.phone) : ""}
            isAdmin={isAdmin}
            href={legal.phone ? `https://wa.me/${legal.phone}` : undefined}
          />
        </IdList>
        <p>
          Los beats son obras musicales y fonogramas protegidos por la Ley 23 de 1982, la Ley 44 de 1993 y la Decisión Andina
          351 de 1993. Sodimusic y el productor JeiVy LaZy son titulares de los derechos patrimoniales sobre el beat.
        </p>
      </Section>

      <Section n={2} id="tipos" title="Tipos de licencia">
        <p>
          Cada beat puede ofrecerse en tres licencias <strong>no exclusivas</strong> (MP3, WAV y Stems), que se diferencian por
          el formato entregado y los límites de explotación, y en una licencia <strong>exclusiva</strong> que se contrata por
          separado mediante contrato escrito. El precio «desde» que ves en el catálogo corresponde a la licencia más básica
          disponible para ese beat.
        </p>
        <LicenseTable
          headers={["Licencia", "Entrega", "Ventas / descargas", "Streams", "Videos", "Shows y radio"]}
          rows={TIERS.map((t) => ({ name: t.name, cells: [t.format, t.sales, t.streams, t.videos, t.shows] }))}
          lastRowSpan={{
            name: "Exclusiva",
            delivery: "Stems + WAV + MP3 + proyecto si se pacta",
            text: "Sin límites de explotación; el beat se retira del catálogo. Requiere contrato firmado.",
          }}
        />
        <p>
          Los límites son por <strong>una (1) obra nueva</strong> creada con el beat. Si tu canción supera los límites de tu
          licencia, puedes ampliarla a la siguiente o pasar a exclusiva pagando la diferencia, siempre que el beat siga
          disponible.
        </p>
      </Section>

      <Section n={3} id="no-exclusiva" title="Licencia no exclusiva (MP3, WAV, Stems)">
        <Sub n="3.1" title="Qué puedes hacer" />
        <ul>
          <li>Grabar una (1) canción nueva sobre el beat y distribuirla en plataformas digitales (Spotify, Apple Music, YouTube, etc.) dentro de los límites de la tabla.</li>
          <li>Interpretarla en vivo y usarla en los videos permitidos por tu licencia.</li>
          <li>Modificar el arreglo (tempo, tonalidad, estructura) para adaptarlo a tu canción.</li>
        </ul>
        <Sub n="3.2" title="Qué no puedes hacer" />
        <ul>
          <li>
            <strong>Revender, ceder, sublicenciar o regalar</strong> el beat ni sus stems, ni usarlos en más de una obra.
          </li>
          <li>
            <strong>Registrar el beat o tu canción en YouTube Content ID</strong>, en sistemas de huella digital o en
            sociedades de gestión como obra enteramente tuya. El productor conserva su parte y el beat sigue licenciándose a
            otros artistas; un registro indebido generaría reclamaciones contra ellos.
          </li>
          <li>Publicar el beat solo (instrumental) ni usarlo como «type beat» o para vender a terceros.</li>
          <li>Usarlo en publicidad, cine, televisión o videojuegos sin una licencia de sincronización adicional.</li>
          <li>Registrar la propiedad del beat a tu nombre ante la DNDA o cualquier otra entidad.</li>
        </ul>
        <Sub n="3.3" title="No exclusividad y vigencia" />
        <p>
          El mismo beat puede licenciarse a otros artistas. La licencia dura diez (10) años desde la compra o hasta alcanzar
          sus límites, lo que ocurra primero. Si otra persona adquiere la licencia exclusiva del mismo beat, tu licencia sigue
          vigente para la canción ya publicada, pero no podrás lanzar nuevas versiones.
        </p>
        <Sub n="3.4" title="Reparto de derechos" />
        <p>
          Salvo acuerdo escrito distinto, el productor conserva el cincuenta por ciento (50%) de los derechos de autor de la
          composición (parte musical) de la canción resultante y el cien por ciento (100%) de los derechos sobre el beat
          original. El artista conserva la letra, la melodía vocal y su interpretación. Los metadatos de distribución deben
          reflejar esta participación.
        </p>
      </Section>

      <Section n={4} id="exclusiva" title="Licencia exclusiva">
        <ul>
          <li>
            Se formaliza únicamente con un <strong>contrato escrito y firmado</strong> por ambas partes; el precio se acuerda
            caso por caso y figura en el catálogo como referencia cuando está disponible.
          </li>
          <li>
            Una vez pagado, el beat se <strong>retira del catálogo</strong> y no se licencia a nadie más. Las licencias no
            exclusivas vendidas antes permanecen vigentes para las canciones ya publicadas.
          </li>
          <li>
            Recibes stems, WAV y MP3 y, si se pacta, el proyecto. Puedes explotar la obra sin límites de ventas, streams o
            videos, y registrarla en Content ID con el reparto de derechos acordado en el contrato.
          </li>
          <li>El productor conserva el crédito y el derecho a mencionar la obra en su portafolio.</li>
        </ul>
      </Section>

      <Section n={5} id="obligaciones" title="Obligaciones comunes">
        <p>
          <strong>Crédito obligatorio.</strong> En todas las licencias debes incluir el crédito{" "}
          <strong>«Prod. by Sodimusic / JeiVy LaZy»</strong> en el título o la descripción de los videos, en los metadatos de
          la distribución digital (campo productor/compositor) y en las redes donde publiques la canción.
        </p>
        <p>
          <strong>Contenido.</strong> Eres responsable de la letra y de cualquier material de terceros que incorpores. No
          puedes usar el beat en contenido que incite al odio o a la violencia, ni atribuirlo a otro productor.
        </p>
        <p>
          <strong>Datos de contacto.</strong> Para gestionar la licencia y resolver reclamaciones de plataformas necesitamos tu
          nombre artístico, correo y teléfono, que tratamos según la{" "}
          <Link href="/legal/privacidad">Política de tratamiento de datos personales</Link>.
        </p>
      </Section>

      <Section n={6} id="entrega" title="Entrega digital y retracto">
        <p>
          Los beats se entregan por <strong>enlace de descarga</strong> después de confirmar el pago. Con tu acuerdo expreso,
          la entrega del archivo constituye el <strong>inicio de la ejecución</strong> del contrato. Por eso, conforme al
          artículo 47 de la Ley 1480 de 2011, <strong>no aplica el derecho de retracto una vez descargado el beat</strong>:
          se trata de un contenido digital cuya prestación comienza con tu consentimiento y que no puede «devolverse». Antes
          de pagar puedes escuchar la vista previa completa en el catálogo y preguntarnos lo que necesites.
        </p>
        <p>
          Un <strong>beat personalizado</strong> (producido a tu medida) es un bien confeccionado según tus especificaciones y
          tampoco admite retracto. Si el archivo llega defectuoso o distinto del licenciado, lo reemplazamos sin costo: aplica
          la garantía legal.
        </p>
      </Section>

      <Section n={7} id="precios" title="Precios, pago e IVA">
        <p>
          Los precios se expresan en pesos colombianos (COP)
          {legal.ivaIncluded ? " e incluyen el IVA cuando aplica" : ""}. Los pagos se hacen por transferencia o Nequi a la
          cuenta que te indicamos desde nuestro WhatsApp oficial, o por el medio que acordemos. Enviamos el archivo y la
          confirmación de licencia (que indica beat, tipo de licencia, fecha y tu nombre) una vez acreditado el pago.
          {legal.ivaResponsible ? " Emitimos factura electrónica de venta por cada licencia." : ""}
        </p>
      </Section>

      <Section n={8} id="terminacion" title="Incumplimiento y terminación">
        <p>
          Si incumples estas condiciones (por ejemplo, revender el beat, registrar Content ID o superar los límites sin
          ampliar la licencia) podremos dar por terminada la licencia con aviso escrito, solicitar la retirada del contenido a
          las plataformas y reclamar los perjuicios causados. La terminación no te da derecho a devolución del precio.
        </p>
      </Section>

      <Section n={9} id="ley" title="Ley aplicable y conflictos">
        <p>
          Esta licencia se rige por las leyes de la República de Colombia. Cualquier diferencia se intentará resolver primero
          de manera directa a través de <MailLink legal={legal} isAdmin={isAdmin} /> o del WhatsApp{" "}
          <WaLink legal={legal} isAdmin={isAdmin} />; de no lograrse en treinta (30) días, las partes podrán acudir a la
          conciliación o a los jueces competentes de Colombia. En lo relativo a derechos del consumidor puedes acudir a la
          Superintendencia de Industria y Comercio (<Ext href={SIC_URL}>www.sic.gov.co</Ext>) y en lo relativo a derechos
          de autor a la Dirección Nacional de Derecho de Autor.
        </p>
      </Section>

      <DocFooter version={legal.termsVersion} note={<>Licenciante: {name}{legal.nit ? ` · NIT ${legal.nit}` : ""}</>} />
    </>
  );
}
