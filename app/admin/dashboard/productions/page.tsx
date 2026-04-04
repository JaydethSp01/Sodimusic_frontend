import { fetchAdmin } from "@/lib/api-admin";
import type { Production } from "@/types/models";
import { AdminProductionsManager } from "@/features/admin/components/admin-productions-manager";

export default async function AdminProductionsPage() {
  const res = await fetchAdmin("/api/admin/productions");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar las producciones.</p>;
  }
  const data = (await res.json()) as { items: Production[] };

  return <AdminProductionsManager initialItems={data.items} />;
}
