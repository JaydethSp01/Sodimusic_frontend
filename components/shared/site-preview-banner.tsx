import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { SitePreviewBannerClient } from "./site-preview-banner-client";

export async function SitePreviewBanner() {
  const cookieStore = await cookies();
  const session = await auth();
  const active = cookieStore.get("site_preview")?.value === "draft" && !!session;
  if (!active) {
    return null;
  }
  return <SitePreviewBannerClient />;
}
