import Link from "next/link";
import {
  DocFooter,
  Ext,
  IdList,
  Line,
  SIC_URL,
  Section,
  Toc,
  formatPhone,
  fullAddress,
  responsibleName,
  type LegalDocProps,
} from "./shared";

const TOC = [
  { id: "identificacion", label: "Identificación del titular" },
  { id: "quejas", label: "Quejas y reclamos" },
  { id: "propiedad", label: "Propiedad intelectual del sitio" },
  { id: "marcas", label: "Marcas" },
  { id: "terceros", label: "Enlaces y contenidos de terceros" },
  { id: "uso", label: "Uso del sitio" },
  { id: "documentos", label: "Otros documentos legales" },
];

export const LEGAL_NOTICE_TITLE = "Aviso legal";
export const LEGAL_NOTICE_DESCRIPTION =
  "Identificación del titular del sitio Sodimusic, canal de quejas ante la SIC, propiedad intelectual, marcas y enlaces a terceros.";

export function LegalNotice({ legal, siteUrl, isAdmin }: LegalDocProps) {
  const name = responsibleName(legal);
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <p className="lead">
        En cumplimiento del deber de información de la Ley 1480 de 2011 y de la Ley 527 de 1999, estos son los datos del
        titular del sitio <a href={siteUrl}>{host}</a> y las condiciones generales de su uso.
      </p>

      <Toc items={TOC} />

      <Section n={1} id="identificacion" title="Identificación del titular">
        <IdList>
          <Line label="Nombre comercial" value={legal.businessName} isAdmin={isAdmin} />
          <Line label="Razón social / titular" value={legal.legalName} isAdmin={isAdmin} what="razón social" />
          <Line label="NIT" value={legal.nit} isAdmin={isAdmin} />
          <Line label="Dirección" value={fullAddress(legal)} isAdmin={isAdmin} what="dirección" />
          <Line label="Correo electrónico" value={legal.email} isAdmin={isAdmin} href={legal.email ? `mailto:${legal.email}` : undefined} what="correo PQR" />
          <Line
            label="WhatsApp"
            value={legal.phone ? formatPhone(legal.phone) : ""}
            isAdmin={isAdmin}
            href={legal.phone ? `https://wa.me/${legal.phone}` : undefined}
          />
          <Line label="Horario de atención" value={legal.hours} isAdmin={isAdmin} />
          <Line label="Sitio web" value={host} href={siteUrl} />
        </IdList>
        <p>
          Actividad: sello discográfico, estudio de grabación y producción musical, licenciamiento de beats y venta de
          merchandising. Si el titular está inscrito en el registro mercantil, su matrícula puede consultarse en el RUES
          (<Ext href="https://www.rues.org.co">rues.org.co</Ext>) con el NIT indicado.
        </p>
      </Section>

      <Section n={2} id="quejas" title="Quejas y reclamos">
        <p>
          Puedes presentar peticiones, quejas y reclamos por el correo o el WhatsApp indicados arriba; respondemos en un máximo
          de quince (15) días hábiles. Si no quedas conforme, la autoridad de protección al consumidor en Colombia es la{" "}
          <strong>Superintendencia de Industria y Comercio (SIC)</strong>: <Ext href={SIC_URL}>www.sic.gov.co</Ext>. Para
          asuntos de datos personales consulta el canal de la{" "}
          <Link href="/legal/privacidad">Política de tratamiento de datos personales</Link>.
        </p>
      </Section>

      <Section n={3} id="propiedad" title="Propiedad intelectual del sitio">
        <p>
          El diseño del sitio, los textos, logotipos, fotografías, videos, beats, producciones y demás contenidos publicados
          son propiedad de {name} o se usan con autorización de sus titulares, y están protegidos por la Ley 23 de 1982, la
          Decisión Andina 351 de 1993 y la Decisión Andina 486 de 2000. No puedes reproducirlos, distribuirlos ni modificarlos
          sin autorización escrita, salvo para uso personal y no comercial o las excepciones que permita la ley. Los beats del
          catálogo solo pueden usarse bajo la <Link href="/legal/licencia-beats">Licencia de beats</Link>.
        </p>
      </Section>

      <Section n={4} id="marcas" title="Marcas">
        <p>
          «Sodimusic» y «Sodimusic Company», sus logotipos y los nombres de sus artistas y proyectos son signos distintivos de{" "}
          {name}. Las menciones a otras marcas, plataformas o artistas (YouTube, Spotify, WhatsApp, Instagram, entre otras)
          pertenecen a sus respectivos titulares y se usan únicamente con fines de identificación, sin que ello implique
          patrocinio o asociación.
        </p>
      </Section>

      <Section n={5} id="terceros" title="Enlaces y contenidos de terceros">
        <p>
          El sitio enlaza a plataformas externas (YouTube, Spotify, Instagram, TikTok, Facebook, WhatsApp) y puede incrustar
          videos alojados en ellas. No controlamos esos servicios ni respondemos por su contenido, disponibilidad o políticas;
          al usarlos aplican sus propios términos. Los videos de YouTube se cargan solo cuando haces clic y a través de{" "}
          <code>youtube-nocookie.com</code>.
        </p>
      </Section>

      <Section n={6} id="uso" title="Uso del sitio">
        <p>
          El sitio se ofrece «tal cual» y procuramos mantenerlo disponible y actualizado, sin garantizar ausencia de
          interrupciones o errores. No está permitido usarlo para fines ilícitos, intentar acceder a áreas restringidas (como el
          panel de administración), extraer datos de forma automatizada ni interferir con su funcionamiento. Podemos modificar
          el contenido y este aviso en cualquier momento; la versión vigente es la publicada en esta página.
        </p>
      </Section>

      <Section n={7} id="documentos" title="Otros documentos legales">
        <ul>
          <li>
            <Link href="/legal/privacidad">Política de tratamiento de datos personales</Link>
          </li>
          <li>
            <Link href="/legal/terminos-tienda">Términos y condiciones de la tienda</Link>
          </li>
          <li>
            <Link href="/legal/terminos-estudio">Términos del estudio y servicios de producción</Link>
          </li>
          <li>
            <Link href="/legal/licencia-beats">Licencia de uso de beats</Link>
          </li>
        </ul>
      </Section>

      <DocFooter version={legal.termsVersion} note={<>Titular: {name}{legal.nit ? ` · NIT ${legal.nit}` : ""}</>} />
    </>
  );
}
