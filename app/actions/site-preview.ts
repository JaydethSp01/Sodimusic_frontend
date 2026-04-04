"use server";

import { cookies } from "next/headers";

export async function setSitePreview(enabled: boolean): Promise<void> {
  const store = await cookies();
  if (enabled) {
    store.set("site_preview", "draft", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30,
    });
  } else {
    store.delete("site_preview");
  }
}
