import type { Metadata } from "next";
import { CalendarClock, Percent } from "lucide-react";
import { HeroPage } from "@/components/ds/hero-page";
import { Badge } from "@/components/ui/badge";
import { BookingWizardLazy } from "@/features/booking/components/booking-wizard-lazy";
import { FaqSection } from "@/components/shared/faq-section";
import { bookingFaq } from "@/content/faq";
import { getSiteContent } from "@/lib/site-config-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: "Agenda tu sesión",
    description: site.booking.heroDescription,
  };
}

export default async function BookingPage() {
  const site = await getSiteContent();
  const legal = {
    businessName: site.legal?.businessName ?? "Sodimusic Company",
    depositPercent: site.legal?.depositPercent ?? 30,
    cancellationHours: site.legal?.cancellationHours ?? 24,
    policyVersion: site.legal?.policyVersion ?? "2026-10-17",
    ivaIncluded: site.legal?.ivaIncluded ?? true,
  };
  return (
    <div>
      <HeroPage
        eyebrow="Estudio"
        title={site.booking.heroTitle}
        description={site.booking.heroDescription}
        aside={
          <ul className="flex flex-wrap gap-2 lg:justify-end" aria-label="Condiciones de la reserva">
            {legal.depositPercent > 0 ? (
              <li>
                <Badge size="md" tone="gold" icon={<Percent aria-hidden />}>
                  {legal.depositPercent}% de anticipo
                </Badge>
              </li>
            ) : null}
            <li>
              <Badge size="md" tone="fire" icon={<CalendarClock aria-hidden />}>
                Reprograma con {legal.cancellationHours} h
              </Badge>
            </li>
            {legal.ivaIncluded ? (
              <li>
                <Badge size="md">IVA incluido</Badge>
              </li>
            ) : null}
          </ul>
        }
      />
      <BookingWizardLazy booking={site.booking} legal={legal} />
      <FaqSection
        items={bookingFaq({ depositPercent: legal.depositPercent, cancellationHours: legal.cancellationHours })}
        subtitle="Anticipo, cancelaciones, entrega de archivos y derechos: lo que más nos preguntan antes de reservar."
      />
    </div>
  );
}
