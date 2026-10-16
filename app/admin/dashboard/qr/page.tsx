import { fetchAdmin } from "@/lib/api-admin";
import type { SiteContent } from "@/types/site-content";
import { AdminQrStudio } from "@/features/admin/components/admin-qr-studio";

export default async function AdminQrPage() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  let configuredTargetUrl = "";
  let qrLabel = "";
  try {
    const res = await fetchAdmin("/api/admin/site-config");
    if (res.ok) {
      const data = (await res.json()) as { draft?: Partial<SiteContent> };
      configuredTargetUrl = data.draft?.qr?.targetUrl?.trim() ?? "";
      qrLabel = data.draft?.qr?.label ?? "";
    }
  } catch {
    // El backend puede no estar disponible: el estudio funciona igual con la URL del sitio.
  }

  return <AdminQrStudio siteUrl={siteUrl} configuredTargetUrl={configuredTargetUrl} qrLabel={qrLabel} />;
}
