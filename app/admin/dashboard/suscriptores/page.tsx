import { AdminSubscribersManager } from "@/features/admin/components/admin-subscribers-manager";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import { fetchAdmin } from "@/lib/api-admin";
import type { Paginated, Subscriber } from "@/types/models";

type Search = { page?: string; q?: string };

const PAGE_SIZE = 25;

export default async function AdminSuscriptoresPage({ searchParams }: { searchParams: Search }) {
  const n = Number(searchParams.page);
  const page = Number.isInteger(n) && n > 0 ? n : 1;
  const q = (searchParams.q ?? "").trim();

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (q) params.set("q", q);

  const res = await fetchAdmin(`/api/admin/subscribers?${params.toString()}`);
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar los suscriptores.</AdminErrorNotice>;
  }
  const data = (await res.json()) as Paginated<Subscriber>;

  return <AdminSubscribersManager data={data} q={q} />;
}
