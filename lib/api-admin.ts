import { getBackendAccessToken } from "./server-token";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function fetchAdmin(path: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getBackendAccessToken();
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }
  const url = `${backendUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}
