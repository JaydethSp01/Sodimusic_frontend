import { fetchAdmin } from "@/lib/api-admin";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import type { Production } from "@/types/models";
import { AdminProductionsManager } from "@/features/admin/components/admin-productions-manager";

export default async function AdminProductionsPage() {
  const res = await fetchAdmin("/api/admin/productions");
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar las producciones.</AdminErrorNotice>;
  }
  const data = (await res.json()) as { items: Production[] };

  return <AdminProductionsManager initialItems={data.items} />;
}
