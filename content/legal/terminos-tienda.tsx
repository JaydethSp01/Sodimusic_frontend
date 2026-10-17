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
  { id: "comerciante", label: "Quién vende" },
  { id: "pedido", label: "Cómo se forma el pedido" },
  { id: "precios", label: "Precios e impuestos" },
  { id: "envio", label: "Envíos y plazos de entrega" },
  { id: "pago", label: "Medios de pago y reversión" },
  { id: "retracto", label: "Derecho de retracto" },
  { id: "garantia", label: "Garantía legal" },
  { id: "cambios", label: "Cambios y tallas" },
  { id: "pqr", label: "Peticiones, quejas y reclamos" },
  { id: "datos", label: "Datos personales" },
  { id: "ley", label: "Ley aplicable" },
];

export const SHOP_TERMS_TITLE = "Términos y condiciones de la tienda";
export const SHOP_TERMS_DESCRIPTION =
  "Condiciones de compra del merch de Sodimusic: formación del pedido por WhatsApp, precios con IVA, envíos, medios de pago, derecho de retracto, garantía legal y canal de PQR.";

export function ShopTerms({ legal, siteUrl, isAdmin }: LegalDocProps) {
  const name = responsibleName(legal);
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <>
      <p className="lead">
        Estos términos regulan la compra de productos de la tienda de <strong>{legal.businessName}</strong> publicados en{" "}
        <a href={`${siteUrl}/tienda`}>{host}/tienda</a>. Al enviar un pedido por WhatsApp aceptas estas condiciones, que
        se rigen por el Estatuto del Consumidor (Ley 1480 de 2011) y sus decretos reglamentarios.
      </p>

      <Toc items={TOC} />

      <Section n={1} id="comerciante" title="Quién vende">
        <IdList>
          <Line label="Nombre comercial" value={legal.businessName} isAdmin={isAdmin} />
          <Line label="Razón social / comerciante" value={legal.legalName} isAdmin={isAdmin} what="razón social" />
          <Line label="NIT" value={legal.nit} isAdmin={isAdmin} />
          <Line label="Dirección" value={fullAddress(legal)} isAdmin={isAdmin} what="dirección" />
          <Line label="Correo" value={legal.email} isAdmin={isAdmin} href={legal.email ? `mailto:${legal.email}` : undefined} what="correo PQR" />
          <Line
            label="WhatsApp"
            value={legal.phone ? formatPhone(legal.phone) : ""}
            isAdmin={isAdmin}
            href={legal.phone ? `https://wa.me/${legal.phone}` : undefined}
          />
          <Line label="Horario de atención" value={legal.hours} isAdmin={isAdmin} />
        </IdList>
      </Section>

      <Section n={2} id="pedido" title="Cómo se forma el pedido">
        <ol>
          <li>
            <strong>Eliges en la web.</strong> Armas tu pedido en la tienda (producto, talla o variante, cantidad). La web no cobra
            ni procesa pagos: solo prepara el mensaje.
          </li>
          <li>
            <strong>Lo envías por WhatsApp.</strong> El botón «Pedir por WhatsApp» abre un chat con el detalle del pedido, el
            total y el enlace a estos términos. Ese mensaje es tu oferta de compra.
          </li>
          <li>
            <strong>Confirmamos por escrito.</strong> Te respondemos por el mismo chat con la disponibilidad, el costo del envío
            y el total definitivo. El contrato queda celebrado cuando recibes nuestra{" "}
            <strong>confirmación escrita</strong> y nos indicas que estás de acuerdo. Hasta ese momento cualquiera de los dos puede
            desistir sin costo.
          </li>
        </ol>
        <p>
          Los mensajes intercambiados por WhatsApp y correo son mensajes de datos con plena validez jurídica y probatoria (Ley
          527 de 1999). Te recomendamos conservar la conversación como soporte de tu compra.
        </p>
        <p>
          Las imágenes de los productos son ilustrativas; el color puede variar levemente según la pantalla. Si un producto se
          agota después de tu pedido, te lo informaremos y podrás elegir otro o cancelar sin costo, con devolución total de lo
          pagado.
        </p>
      </Section>

      <Section n={3} id="precios" title="Precios e impuestos">
        <p>
          Todos los precios se expresan en <strong>pesos colombianos (COP)</strong>
          {legal.ivaIncluded ? (
            <>
              {" "}
              e <strong>incluyen el IVA</strong> cuando este aplica, de modo que el valor que ves es el valor final del producto.
            </>
          ) : (
            <>. El IVA aplicable, si lo hay, se informa antes de confirmar el pedido.</>
          )}{" "}
          El costo del envío no está incluido y se cotiza aparte (sección 4).
        </p>
        <p>
          {legal.ivaResponsible ? (
            <>
              Somos responsables de IVA y emitimos factura electrónica de venta por cada pedido confirmado; indícanos los datos de
              facturación si los necesitas con nombre o NIT distinto.
            </>
          ) : (
            <>
              Emitimos el documento de venta que corresponda a nuestro régimen tributario. Si necesitas un documento con datos
              específicos, indícalo al confirmar el pedido.
            </>
          )}
        </p>
        <p>
          Los precios pueden cambiar sin previo aviso, pero el precio aplicable a tu pedido es el vigente al momento de nuestra
          confirmación escrita. Si en la web aparece un precio tachado («Antes»), corresponde al precio anterior del mismo
          producto en nuestra tienda.
        </p>
      </Section>

      <Section n={4} id="envio" title="Envíos y plazos de entrega">
        <ul>
          <li>Enviamos a todo Colombia por transportadora. El costo depende del destino y del peso, y se cotiza por WhatsApp antes de confirmar.</li>
          <li>
            Despachamos dentro de los tres (3) días hábiles siguientes a la confirmación del pago, salvo que te indiquemos otro
            plazo por tratarse de un producto bajo pedido o personalizado.
          </li>
          <li>
            El plazo de entrega de la transportadora suele ser de dos (2) a ocho (8) días hábiles según la ciudad. Te enviaremos
            el número de guía para que hagas seguimiento.
          </li>
          <li>
            También puedes recoger tu pedido sin costo en nuestra dirección, en el horario de atención, previa coordinación.
          </li>
          <li>
            Si el pedido no llega dentro del plazo informado, escríbenos: gestionaremos la novedad con la transportadora y, si
            no es posible entregarlo, te devolveremos el dinero.
          </li>
        </ul>
      </Section>

      <Section n={5} id="pago" title="Medios de pago y reversión">
        <p>
          Aceptamos <strong>transferencia bancaria</strong> y <strong>Nequi</strong>, y los medios adicionales que acordemos por
          WhatsApp. Los datos de la cuenta siempre te los enviamos desde nuestro WhatsApp oficial (sección 1); no hagas pagos a
          cuentas informadas por otros canales.
        </p>
        <p>
          El pedido se despacha una vez confirmado el pago. Si en siete (7) días calendario no recibimos el pago, el pedido se
          entiende cancelado.
        </p>
        <Sub n="5.1" title="Reversión del pago" />
        <p>
          Cuando el pago se haya hecho con tarjeta de crédito, débito u otro instrumento de pago electrónico, puedes solicitar
          la <strong>reversión del pago</strong> en los casos del artículo 51 de la Ley 1480 de 2011 (fraude, operación no
          solicitada, producto no recibido, producto distinto o defectuoso) dentro de los cinco (5) días hábiles siguientes a
          que conociste la causa, conforme al Decreto 587 de 2016. La solicitud se presenta ante el emisor del instrumento de
          pago y también a nosotros. La reversión no aplica a pagos hechos por transferencia o consignación directa; en esos
          casos operan el retracto, la garantía y la devolución del dinero de las secciones 6 y 7.
        </p>
      </Section>

      <Section n={6} id="retracto" title="Derecho de retracto">
        <p>
          Por tratarse de una venta no presencial, puedes ejercer el <strong>derecho de retracto</strong> dentro de los{" "}
          <strong>cinco (5) días hábiles</strong> siguientes a la entrega del producto, sin necesidad de justificarlo (artículo
          47 de la Ley 1480 de 2011). Para hacerlo escríbenos por WhatsApp o al correo de la sección 1 con el número o la fecha
          del pedido.
        </p>
        <Sub n="6.1" title="Condiciones" />
        <ul>
          <li>Debes devolver el producto en las mismas condiciones en que lo recibiste, sin uso, con etiquetas y empaque.</li>
          <li>Los costos de transporte de la devolución y los demás que implique corren por tu cuenta.</li>
          <li>
            Te devolveremos el dinero pagado por el producto por el mismo medio o el que acuerdes, dentro de los{" "}
            <strong>quince (15) días calendario</strong> siguientes a que recibamos el producto (la ley fija un máximo de
            treinta).
          </li>
        </ul>
        <Sub n="6.2" title="Excepciones" />
        <p>El retracto no aplica, por disposición legal, a:</p>
        <ul>
          <li>
            Bienes <strong>confeccionados según tus especificaciones o claramente personalizados</strong> (por ejemplo,
            prendas con nombre o diseño a medida).
          </li>
          <li>
            Bienes <strong>de uso personal</strong> que por higiene no pueden devolverse una vez abiertos (ropa interior, gorras
            usadas, etc.).
          </li>
          <li>Bienes que por su naturaleza no puedan devolverse o puedan deteriorarse con rapidez.</li>
        </ul>
      </Section>

      <Section n={7} id="garantia" title="Garantía legal">
        <p>
          Todos los productos tienen la <strong>garantía legal</strong> de calidad e idoneidad de la Ley 1480 de 2011. Salvo
          indicación distinta en la ficha del producto, la garantía de los productos nuevos es de <strong>un (1) año</strong>{" "}
          desde la entrega. Cubre defectos de fabricación, de materiales o de confección; no cubre el desgaste normal, el mal uso
          ni los daños por lavado o cuidado inadecuado.
        </p>
        <p>
          Si el producto presenta un defecto, escríbenos con fotos y la fecha de compra. Según el caso haremos la reparación,
          el cambio por uno igual o, si no es posible, la devolución del dinero, en los plazos que fija la ley. Los costos de
          transporte para hacer efectiva la garantía los asumimos nosotros.
        </p>
      </Section>

      <Section n={8} id="cambios" title="Cambios y tallas">
        <p>
          Además del retracto, aceptamos <strong>cambios de talla</strong> dentro de los ocho (8) días calendario siguientes a
          la entrega, siempre que la prenda esté sin uso, con etiquetas, y tengamos existencias de la talla que necesitas. El
          costo del transporte de ida y vuelta por cambio de talla lo asume el comprador. Revisa la guía de tallas de cada
          producto antes de pedir; si tienes dudas, pregúntanos por WhatsApp.
        </p>
      </Section>

      <Section n={9} id="pqr" title="Peticiones, quejas y reclamos">
        <p>
          Atendemos peticiones, quejas y reclamos en el correo <MailLink legal={legal} isAdmin={isAdmin} /> y en el WhatsApp{" "}
          <WaLink legal={legal} isAdmin={isAdmin} />
          {hasValue(legal.hours) ? <> ({legal.hours})</> : null}. Respondemos en un máximo de quince (15) días hábiles.
        </p>
        <p>
          Si no quedas conforme con la respuesta, puedes acudir a la <strong>Superintendencia de Industria y Comercio</strong>{" "}
          (<Ext href={SIC_URL}>www.sic.gov.co</Ext>), autoridad de protección al consumidor en Colombia, o a los demás
          mecanismos que establece la ley.
        </p>
      </Section>

      <Section n={10} id="datos" title="Datos personales">
        <p>
          Los datos que nos compartes para tu pedido (nombre, dirección, teléfono, comprobante de pago) se usan únicamente para
          preparar, facturar y entregar la compra, conforme a nuestra{" "}
          <Link href="/legal/privacidad">Política de tratamiento de datos personales</Link>.
        </p>
      </Section>

      <Section n={11} id="ley" title="Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia, en especial la Ley 1480 de 2011, el Decreto 1074
          de 2015 y la Ley 527 de 1999. Cualquier controversia se intentará resolver primero de forma directa a través del
          canal de PQR; de no ser posible, podrá acudirse a la SIC o a los jueces competentes.
        </p>
      </Section>

      <DocFooter version={legal.termsVersion} note={<>Vendedor: {name}{legal.nit ? ` · NIT ${legal.nit}` : ""}</>} />
    </>
  );
}
