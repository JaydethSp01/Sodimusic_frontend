import { fetchAdmin } from "@/lib/api-admin";
import type { Release } from "@/types/models";
import { AdminReleasesManager } from "@/features/admin/components/admin-releases-manager";

export default async function AdminReleasesPage() {
  const res = await fetchAdmin("/api/admin/releases");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar los releases.</p>;
  }
  const data = (await res.json()) as { items: Release[] };

  return <AdminReleasesManager initialItems={data.items} />;
}
