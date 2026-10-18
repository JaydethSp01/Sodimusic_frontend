import { fetchAdmin } from "@/lib/api-admin";
import type { Paginated, SocialPost, SocialSource, SocialStatus } from "@/types/models";
import { AdminSocialManager, ADMIN_SOCIAL_PAGE_SIZE } from "@/features/admin/components/admin-social-manager";

type Search = { page?: string; q?: string; status?: string };

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetchAdmin(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function AdminNovedadesPage({ searchParams }: { searchParams: Search }) {
  const page = parsePage(searchParams.page);
  const q = searchParams.q?.trim() ?? "";
  const status = searchParams.status === "VISIBLE" || searchParams.status === "HIDDEN" ? searchParams.status : "ALL";

  const params = new URLSearchParams({ page: String(page), pageSize: String(ADMIN_SOCIAL_PAGE_SIZE), status });
  if (q) params.set("q", q);

  const [statusData, sourcesData, postsData] = await Promise.all([
    readJson<Partial<SocialStatus>>("/api/admin/social/status"),
    readJson<{ items?: SocialSource[] }>("/api/admin/social/sources"),
    readJson<Partial<Paginated<SocialPost>>>(`/api/admin/social/posts?${params.toString()}`),
  ]);

  const items = Array.isArray(postsData?.items) ? postsData.items : [];

  return (
    <AdminSocialManager
      status={statusData && statusData.env && statusData.counts ? (statusData as SocialStatus) : null}
      sources={Array.isArray(sourcesData?.items) ? sourcesData.items : []}
      posts={items}
      total={typeof postsData?.total === "number" ? postsData.total : items.length}
      page={typeof postsData?.page === "number" ? postsData.page : page}
      pageSize={typeof postsData?.pageSize === "number" && postsData.pageSize > 0 ? postsData.pageSize : ADMIN_SOCIAL_PAGE_SIZE}
      query={q}
      statusFilter={status}
      apiUnavailable={postsData === null}
    />
  );
}
