import { fetchAdmin } from "@/lib/api-admin";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import { normalizeArtist } from "@/features/artists/api";
import { AdminArtistsManager } from "@/features/admin/components/admin-artists-manager";
import type { Artist } from "@/types/models";

type Search = { q?: string; status?: string };

export default async function AdminArtistasPage({ searchParams }: { searchParams: Search }) {
  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status === "ACTIVE" || searchParams.status === "HIDDEN" ? searchParams.status : "";

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const qs = params.toString();

  const res = await fetchAdmin(`/api/admin/artists${qs ? `?${qs}` : ""}`);
  if (res.status === 404) {
    // La API de artistas aún no está desplegada: tabla vacía (sin error) para poder crear el primero.
    return <AdminArtistsManager items={[]} query={q} status={status} apiMissing />;
  }
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar los artistas.</AdminErrorNotice>;
  }
  const data = (await res.json()) as { items?: Artist[] } | Artist[];
  const raw = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  const items = raw.map(normalizeArtist);

  return <AdminArtistsManager items={items} query={q} status={status} />;
}
