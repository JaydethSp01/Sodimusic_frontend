import type { Metadata } from "next";
import { BookingSuccessView } from "@/features/booking/components/booking-success-view";
import { getSiteContent } from "@/lib/site-config-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.bookingSuccess.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function BookingSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const site = await getSiteContent();
  const id = searchParams.id ?? "";
  const code = id.length >= 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();

  return <BookingSuccessView code={code || "—"} copy={site.bookingSuccess} />;
}
