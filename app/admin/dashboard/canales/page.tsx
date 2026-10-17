import { fetchAdmin } from "@/lib/api-admin";
import type { Paginated, YoutubeChannel } from "@/types/models";
import { AdminChannelsManager, ADMIN_CHANNELS_PAGE_SIZE } from "@/features/admin/components/admin-channels-manager";

type Search = { page?: string; q?: string; status?: string };

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function AdminCanalesPage({ searchParams }: { searchParams: Search }) {
  const page = parsePage(searchParams.page);
  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status === "ACTIVE" || searchParams.status === "HIDDEN" ? searchParams.status : "";

  const params = new URLSearchParams({ page: String(page), pageSize: String(ADMIN_CHANNELS_PAGE_SIZE) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);

  const res = await fetchAdmin(`/api/admin/channels?${params.toString()}`);
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar los canales de YouTube.</p>;
  }
  const data = (await res.json()) as Partial<Paginated<YoutubeChannel>>;
  const items = Array.isArray(data.items) ? data.items : [];

  // Categorías existentes para el datalist del formulario (sin filtros, hasta 200).
  const catRes = await fetchAdmin("/api/admin/channels?pageSize=200");
  const catData = catRes.ok ? ((await catRes.json()) as Partial<Paginated<YoutubeChannel>>) : {};
  const categories = Array.from(
    new Set((Array.isArray(catData.items) ? catData.items : []).map((c) => c.category?.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <AdminChannelsManager
      items={items}
      total={typeof data.total === "number" ? data.total : items.length}
      page={typeof data.page === "number" ? data.page : page}
      pageSize={typeof data.pageSize === "number" && data.pageSize > 0 ? data.pageSize : ADMIN_CHANNELS_PAGE_SIZE}
      query={q}
      status={status}
      categories={categories}
    />
  );
}
