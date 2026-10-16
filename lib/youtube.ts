/** Utilidades de YouTube sin API key: parseo de URLs y URLs de embed (dominio nocookie). */

const EMBED_BASE = "https://www.youtube-nocookie.com/embed";

function tryParseUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw) {
    return null;
  }
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  const u = tryParseUrl(url);
  if (!u) {
    return false;
  }
  const host = u.hostname.replace(/^www\.|^m\.|^music\./, "");
  return host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com";
}

/** `https://www.youtube.com/channel/UCxxxx` → `UCxxxx`. Devuelve null para @handles o URLs no reconocidas. */
export function parseYoutubeChannelId(url: string): string | null {
  const u = tryParseUrl(url);
  if (!u || !isYoutubeUrl(url)) {
    return null;
  }
  const m = u.pathname.match(/\/channel\/(UC[\w-]{20,})/);
  return m ? m[1] : null;
}

/** Soporta watch?v=, youtu.be/, shorts/, embed/, live/. */
export function parseYoutubeVideoId(url: string): string | null {
  const u = tryParseUrl(url);
  if (!u || !isYoutubeUrl(url)) {
    return null;
  }
  const isId = (s: string | null | undefined): s is string => !!s && /^[\w-]{11}$/.test(s);

  const host = u.hostname.replace(/^www\.|^m\.|^music\./, "");
  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return isId(id) ? id : null;
  }

  const v = u.searchParams.get("v");
  if (isId(v)) {
    return v;
  }

  const m = u.pathname.match(/\/(?:shorts|embed|live|v)\/([\w-]{11})/);
  return m ? m[1] : null;
}

/** Lista de subidas de un canal: `UC…` → playlist `UU…` (misma cola de caracteres). */
export function uploadsPlaylistEmbedUrl(channelId: string): string {
  const id = channelId.trim();
  const list = id.startsWith("UC") ? `UU${id.slice(2)}` : id;
  return `${EMBED_BASE}/videoseries?list=${encodeURIComponent(list)}`;
}

export function videoEmbedUrl(videoId: string): string {
  return `${EMBED_BASE}/${encodeURIComponent(videoId.trim())}`;
}

/** Enlace de suscripción con confirmación (solo si el destino es YouTube). */
export function subscribeUrl(channelUrl: string): string {
  if (!isYoutubeUrl(channelUrl)) {
    return channelUrl;
  }
  const u = tryParseUrl(channelUrl);
  if (!u) {
    return channelUrl;
  }
  u.searchParams.set("sub_confirmation", "1");
  return u.toString();
}
