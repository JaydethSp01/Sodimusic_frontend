import { SectionCallout } from "@/components/shared/section-callout";
import { AdminMessagesManager, type MessagesTab } from "@/features/admin/components/admin-messages-manager";
import { fetchAdmin } from "@/lib/api-admin";
import { getSiteContent } from "@/lib/site-config-server";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import type { BeatInterestRow, ContactMessage, Paginated } from "@/types/models";

type Search = { tab?: string; page?: string; status?: string; bpage?: string; q?: string };

const PAGE_SIZE = 20;

function toPage(v: string | undefined): number {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function emptyPage<T>(page: number): Paginated<T> {
  return { items: [], total: 0, page, pageSize: PAGE_SIZE };
}

export default async function AdminMensajesPage({ searchParams }: { searchParams: Search }) {
  const tab: MessagesTab = searchParams.tab === "beats" ? "beats" : "contacto";
  const page = toPage(searchParams.page);
  const bpage = toPage(searchParams.bpage);
  const status = ["NEW", "READ", "ARCHIVED"].includes(searchParams.status ?? "") ? (searchParams.status as string) : "all";
  const q = (searchParams.q ?? "").trim();

  const msgParams = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (status !== "all") msgParams.set("status", status);
  const intParams = new URLSearchParams({ page: String(bpage), pageSize: String(PAGE_SIZE) });
  if (q) intParams.set("q", q);

  const [msgRes, intRes, site] = await Promise.all([
    fetchAdmin(`/api/admin/messages?${msgParams.toString()}`),
    fetchAdmin(`/api/admin/beat-interests?${intParams.toString()}`),
    getSiteContent(),
  ]);

  if (!msgRes.ok && !intRes.ok) {
    return <p className="text-red-500">No se pudieron cargar los mensajes.</p>;
  }

  const messages = msgRes.ok ? ((await msgRes.json()) as Paginated<ContactMessage>) : emptyPage<ContactMessage>(page);
  const interests = intRes.ok ? ((await intRes.json()) as Paginated<BeatInterestRow>) : emptyPage<BeatInterestRow>(bpage);

  const subjects = site.contactPage?.subjects?.length ? site.contactPage.subjects : SITE_CONTENT_DEFAULTS.contactPage.subjects;
  const subjectLabels = Object.fromEntries(subjects.map((s) => [s.value, s.label]));
  const businessName = site.legal?.businessName ?? SITE_CONTENT_DEFAULTS.legal.businessName;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Mensajes</h1>
        <div className="mt-2 max-w-3xl">
          <SectionCallout>
            Mensajes del formulario de contacto/prensa y personas interesadas en beats. Marca como leído lo que ya
            atendiste y archiva lo cerrado; los nuevos cuentan en el panel.
          </SectionCallout>
        </div>
      </div>

      <AdminMessagesManager
        tab={tab}
        messages={messages}
        status={status}
        interests={interests}
        q={q}
        subjectLabels={subjectLabels}
        businessName={businessName}
      />
    </div>
  );
}
