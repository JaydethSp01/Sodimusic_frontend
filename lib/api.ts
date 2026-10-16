const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? backendUrl;
}

/**
 * Fetch al backend público. Si la API no responde (red caída, ECONNREFUSED),
 * devuelve una `Response` 503 en lugar de lanzar, para que las páginas
 * puedan degradar a listas vacías comprobando `res.ok`.
 */
export async function fetchPublic(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getPublicApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    return await fetch(url, {
      ...init,
      next: init?.next ?? { revalidate: 60 },
    });
  } catch {
    return new Response(null, { status: 503, statusText: "Backend unavailable" });
  }
}
