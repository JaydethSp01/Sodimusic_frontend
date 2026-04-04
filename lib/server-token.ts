import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

export async function getBackendAccessToken(): Promise<string | null> {
  const h = await headers();
  const headersRecord: Record<string, string> = {};
  h.forEach((value, key) => {
    headersRecord[key] = value;
  });
  const token = await getToken({
    req: { headers: headersRecord },
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const at = token?.accessToken;
  return typeof at === "string" ? at : null;
}
