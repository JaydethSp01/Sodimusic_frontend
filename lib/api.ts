const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? backendUrl;
}

export async function fetchPublic(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getPublicApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    next: init?.next ?? { revalidate: 60 },
  });
}
