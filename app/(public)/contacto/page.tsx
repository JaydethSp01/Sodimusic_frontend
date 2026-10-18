import type { Metadata } from "next";
import { HeroPage } from "@/components/ds/hero-page";
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
      <HeroPage eyebrow="Prensa · demos · booking" title={contactPage.pageTitle} accent="prensa" description={contactPage.pageDescription} />

      <div className="container-page py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <h2 className="sr-only">Formulario de contacto</h2>
            <ContactForm
              subjects={subjects}
              businessName={legal.businessName}
              policyVersion={legal.policyVersion}
              initialSubject={searchParams?.asunto}
            />
          </div>
          <aside className="min-w-0 space-y-12 lg:col-span-5">
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
