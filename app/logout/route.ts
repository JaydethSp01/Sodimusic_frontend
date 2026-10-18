import { NextResponse } from "next/server";

const AUTH_COOKIE = /^(__Secure-|__Host-)?authjs\.(session-token|csrf-token|callback-url)(\.\d+)?$/;

/** Expira todas las cookies de auth.js presentes en la petición (con `Secure` para los prefijos __Secure-/__Host-). */
function expireAuthCookies(request: Request, res: NextResponse): void {
  const raw = request.headers.get("cookie") ?? "";
  const https = new URL(request.url).protocol === "https:";
  for (const part of raw.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && AUTH_COOKIE.test(name)) {
      const secure = https || name.startsWith("__Secure-") || name.startsWith("__Host-");
      res.cookies.set({ name, value: "", path: "/", maxAge: 0, expires: new Date(0), secure, httpOnly: true, sameSite: "lax" });
    }
  }
  res.headers.set("Cache-Control", "no-store");
}

const DONE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Cerrando sesión…</title><noscript><meta http-equiv="refresh" content="2;url=/admin/login"></noscript><style>html{background:#050404;color:#bdb6ac;font:16px system-ui,sans-serif}body{display:grid;place-items:center;min-height:100vh;margin:0}</style></head><body><p>Cerrando sesión…</p><script>setTimeout(function(){fetch("/logout",{method:"POST",credentials:"include",cache:"no-store"}).catch(function(){}).then(function(){location.replace("/admin/login")})},700)</script></body></html>`;

/**
 * Cierre de sesión del admin. Vive fuera de `/admin/*` a propósito: el middleware de auth.js
 * vuelve a emitir la cookie de sesión en cada respuesta bajo ese matcher (incluidas las precargas
 * del menú que puedan llegar DESPUÉS de pulsar «Cerrar sesión»). Por eso el cierre va en dos
 * pasos: el POST del formulario expira las cookies y devuelve una página mínima que, 700 ms más
 * tarde (cuando ya no quedan respuestas en vuelo), vuelve a expirarlas con un segundo POST y
 * recién entonces navega al login. Con estrategia JWT no hay sesión en servidor: expirar las
 * cookies es cerrar la sesión. Solo POST (un GET prefetchable cerraría sesión por accidente).
 */
export async function POST(request: Request): Promise<Response> {
  const wantsJson = request.headers.get("accept")?.includes("application/json") || request.headers.get("sec-fetch-mode") === "cors";
  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : new NextResponse(DONE_HTML, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  expireAuthCookies(request, res);
  return res;
}
