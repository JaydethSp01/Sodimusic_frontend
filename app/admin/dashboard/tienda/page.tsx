import { fetchAdmin } from "@/lib/api-admin";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import type { Product } from "@/types/models";
import { AdminProductsManager } from "@/features/admin/components/admin-products-manager";

export default async function AdminTiendaPage() {
  const res = await fetchAdmin("/api/admin/products");
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar los productos de la tienda.</AdminErrorNotice>;
  }
  const data = (await res.json()) as { items?: Product[] };

  return <AdminProductsManager initialItems={Array.isArray(data.items) ? data.items : []} />;
}
