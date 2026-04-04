import { fetchAdmin } from "@/lib/api-admin";
import type { Beat } from "@/types/models";
import { AdminBeatsManager } from "@/features/admin/components/admin-beats-manager";

export default async function AdminBeatsPage() {
  const res = await fetchAdmin("/api/admin/beats");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar los beats.</p>;
  }
  const data = (await res.json()) as { items: Beat[] };

  return <AdminBeatsManager initialItems={data.items} />;
}
