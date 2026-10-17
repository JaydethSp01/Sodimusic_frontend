import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { ContactForm } from "@/features/contact/components/contact-form";
import { DirectContact } from "@/features/contact/components/direct-contact";
import { PressKit } from "@/features/contact/components/press-kit";
import { getSiteContent } from "@/lib/site-config-server";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import type { SiteContact, SiteLegal } from "@/types/site-content";

type Search = { asunto?: string };

async function loadContactData() {
  const site = await getSiteContent();
  const contactPage: SiteContact = { ...SITE_CONTENT_DEFAULTS.contactPage, ...(site.contactPage ?? {}) };
  const legal: SiteLegal = { ...SITE_CONTENT_DEFAULTS.legal, ...(site.legal ?? {}) };
  const contact = { ...SITE_CONTENT_DEFAULTS.contact, ...(site.contact ?? {}) };
  return { site, contactPage, legal, contact };
}

export async function generateMetadata(): Promise<Metadata> {
  const { contactPage } = await loadContactData();
  return {
    title: contactPage.pageTitle,
    description: contactPage.pageDescription,
    alternates: { canonical: "/contacto" },
    openGraph: { title: contactPage.pageTitle, description: contactPage.pageDescription },
  };
}

export default async function ContactoPage({ searchParams }: { searchParams?: Search }) {
  const { contactPage, legal, contact } = await loadContactData();
  const subjects = contactPage.subjects?.length ? contactPage.subjects : SITE_CONTENT_DEFAULTS.contactPage.subjects;

  return (
    <div>
      <PageHero eyebrow="Prensa · demos · booking" title={contactPage.pageTitle} description={contactPage.pageDescription} />

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <div>
            <h2 className="sr-only">Formulario de contacto</h2>
            <ContactForm
              subjects={subjects}
              businessName={legal.businessName}
              policyVersion={legal.policyVersion}
              initialSubject={searchParams?.asunto}
            />
          </div>
          <aside className="space-y-8">
            <DirectContact
              whatsapp={legal.phone || contact.whatsapp}
              email={contact.email || legal.email}
              businessName={legal.businessName}
              hours={legal.hours}
              city={[legal.city, legal.country].filter(Boolean).join(", ")}
            />
            <PressKit contactPage={contactPage} businessName={legal.businessName} />
          </aside>
        </div>
      </div>
    </div>
  );
}
