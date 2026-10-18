import { fetchAdmin } from "@/lib/api-admin";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import type { Release } from "@/types/models";
import { AdminReleasesManager } from "@/features/admin/components/admin-releases-manager";

export default async function AdminReleasesPage() {
  const res = await fetchAdmin("/api/admin/releases");
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar los releases.</AdminErrorNotice>;
  }
  const data = (await res.json()) as { items: Release[] };

  return <AdminReleasesManager initialItems={data.items} />;
}
