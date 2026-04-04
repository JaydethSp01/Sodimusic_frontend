import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { fetchPublic } from "@/lib/api";
import { fetchAdmin } from "@/lib/api-admin";
import type { SiteContent } from "@/types/site-content";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const cookieStore = await cookies();
  const wantsPreview = cookieStore.get("site_preview")?.value === "draft";
  const session = await auth();
  if (wantsPreview && session) {
    const res = await fetchAdmin("/api/admin/site-config", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { draft: SiteContent };
      return data.draft;
    }
  }
  const res = await fetchPublic("/api/site-config", {
    next: { tags: ["site-config"], revalidate: 60 },
  });
  if (!res.ok) {
    return SITE_CONTENT_DEFAULTS;
  }
  const data = (await res.json()) as { content: SiteContent };
  return data.content;
});
