import { fetchAdmin } from "@/lib/api-admin";
import { SiteConfigEditor } from "@/features/admin/site-config/site-config-editor";
import type { SiteContent } from "@/types/site-content";

export default async function AdminSitePage() {
  const res = await fetchAdmin("/api/admin/site-config");
  if (!res.ok) {
    return <p className="text-red-500">No se pudo cargar la configuración del sitio.</p>;
  }
  const data = (await res.json()) as {
    draft: SiteContent;
    publishedAt: string | null;
    draftUpdatedAt: string;
  };
  return (
    <SiteConfigEditor
      initialDraft={data.draft}
      publishedAt={data.publishedAt}
      draftUpdatedAt={data.draftUpdatedAt}
    />
  );
}
