import { SectionCallout } from "@/components/shared/section-callout";
import { AdminSubscribersManager } from "@/features/admin/components/admin-subscribers-manager";
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
    return <p className="text-red-500">No se pudieron cargar los suscriptores.</p>;
  }
  const data = (await res.json()) as Paginated<Subscriber>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Suscriptores</h1>
        <div className="mt-2 max-w-3xl">
          <SectionCallout>
            Lista del boletín con autorización de datos (Ley 1581/2012). Exporta el CSV para tu herramienta de
            correo; las bajas se conservan con su fecha para no volver a escribirles.
          </SectionCallout>
        </div>
      </div>

      <AdminSubscribersManager data={data} q={q} />
    </div>
  );
}
