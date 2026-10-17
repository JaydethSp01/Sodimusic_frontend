import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { BookingWizardLazy } from "@/features/booking/components/booking-wizard-lazy";
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
      <PageHero title={site.booking.heroTitle} description={site.booking.heroDescription} />
      <BookingWizardLazy booking={site.booking} legal={legal} />
    </div>
  );
}
