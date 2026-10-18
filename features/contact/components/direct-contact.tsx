import { Clock, Mail, MapPin } from "lucide-react";
import { ListRow } from "@/components/ds/list-row";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

type Props = {
  whatsapp: string;
  email: string;
  businessName: string;
  hours?: string;
  city?: string;
};

/** Contacto directo (§6.5): «Hablemos» en display-md, WhatsApp y correo como `ListRow` grandes, horario y dirección en mono. */
export function DirectContact({ whatsapp, email, businessName, hours, city }: Props) {
  const phone = whatsapp.replace(/\D/g, "");
  const waHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${businessName}, les escribo desde la página de contacto.`)}`
    : null;
  const pretty = phone ? `+${phone.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4")}` : "";

  return (
    <section aria-labelledby="direct-contact-title">
      <Eyebrow>Directo</Eyebrow>
      <Heading as="h2" size="display-md" id="direct-contact-title" accent="Hablemos" className="mt-4">
        Hablemos
      </Heading>
      <ul className="mt-6 border-t border-line-1">
        {waHref ? (
          <ListRow
            as="li"
            href={waHref}
            title="WhatsApp"
            meta={<span className="font-mono text-label text-text-2">{pretty}</span>}
            media={
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/[0.14] text-whatsapp">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
            }
            action={<span className="text-label text-text-3">Abrir chat</span>}
            className="min-h-[88px] px-0"
          />
        ) : null}
        {email ? (
          <ListRow
            as="li"
            href={`mailto:${email}`}
            title="Correo"
            meta={<span className="truncate font-mono text-label normal-case text-text-2">{email}</span>}
            media={
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fire-500/[0.14] text-fire-400">
                <Mail className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
            }
            action={<span className="text-label text-text-3">Escribir</span>}
            className="min-h-[88px] px-0"
          />
        ) : null}
      </ul>
      {hours || city ? (
        <dl className="mt-6 space-y-3">
          {hours ? (
            <div className="flex items-start gap-3">
              <dt className="sr-only">Horario</dt>
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-3" strokeWidth={1.75} aria-hidden />
              <dd className="font-mono text-label normal-case text-text-2">{hours}</dd>
            </div>
          ) : null}
          {city ? (
            <div className="flex items-start gap-3">
              <dt className="sr-only">Dirección</dt>
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-3" strokeWidth={1.75} aria-hidden />
              <dd className="font-mono text-label normal-case text-text-2">{city}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
