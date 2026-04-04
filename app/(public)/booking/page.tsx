import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { BookingWizard } from "@/features/booking/components/booking-wizard";
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
  return (
    <div>
      <PageHero title={site.booking.heroTitle} description={site.booking.heroDescription} />
      <BookingWizard booking={site.booking} />
    </div>
  );
}
