import { Clock, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

type Props = {
  whatsapp: string;
  email: string;
  businessName: string;
  hours?: string;
  city?: string;
};

/** Contacto directo: WhatsApp (wa.me con mensaje), correo y horario. */
export function DirectContact({ whatsapp, email, businessName, hours, city }: Props) {
  const phone = whatsapp.replace(/\D/g, "");
  const waHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${businessName}, les escribo desde la página de contacto.`)}`
    : null;
  const pretty = phone ? `+${phone.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4")}` : "";

  return (
    <section aria-labelledby="direct-contact-title" className="card-surface p-6 sm:p-8">
      <p className="eyebrow">Directo</p>
      <h2 id="direct-contact-title" className="display-title mt-3 text-4xl text-foreground sm:text-5xl">
        Hablemos
      </h2>
      <ul className="mt-5 space-y-3">
        {waHref ? (
          <li>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-md border border-[color:var(--whatsapp)]/30 bg-[color:var(--whatsapp)]/10 px-4 py-3 text-sm text-foreground transition-colors hover:bg-[color:var(--whatsapp)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0 text-[color:var(--whatsapp)]" />
              <span className="min-w-0">
                <span className="block font-medium">WhatsApp</span>
                <span className="block text-xs text-[var(--text-secondary)]">{pretty}</span>
              </span>
            </a>
          </li>
        ) : null}
        {email ? (
          <li>
            <a
              href={`mailto:${email}`}
              className="flex min-h-[44px] items-center gap-3 rounded-md border border-border bg-background-secondary/60 px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block font-medium">Correo</span>
                <span className="block truncate text-xs text-[var(--text-secondary)]">{email}</span>
              </span>
            </a>
          </li>
        ) : null}
        {hours ? (
          <li className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)]">
            <Clock className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
            {hours}
          </li>
        ) : null}
        {city ? (
          <li className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)]">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
            {city}
          </li>
        ) : null}
      </ul>
    </section>
  );
}
