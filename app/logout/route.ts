import { NextResponse } from "next/server";

const AUTH_COOKIE = /^(__Secure-|__Host-)?authjs\.(session-token|csrf-token|callback-url)(\.\d+)?$/;

/**
 * Cierre de sesión del admin. Vive fuera de `/admin/*` a propósito: el middleware de auth.js
 * vuelve a emitir la cookie de sesión en cada respuesta bajo ese matcher y anulaba el borrado.
 * Con estrategia JWT no hay sesión en servidor: expirar las cookies es cerrar la sesión.
 * Solo POST (un GET prefetchable cerraría sesión por accidente).
 */
export async function POST(request: Request): Promise<Response> {
  const res = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && AUTH_COOKIE.test(name)) {
      // Las cookies con prefijo __Secure-/__Host- (producción, https) solo se borran si la cookie
      // de expiración lleva también `Secure`; sin él el navegador la ignora y la sesión sigue viva.
      const secure = name.startsWith("__Secure-") || name.startsWith("__Host-") || new URL(request.url).protocol === "https:";
      res.cookies.set({ name, value: "", path: "/", maxAge: 0, expires: new Date(0), secure, httpOnly: true, sameSite: "lax" });
    }
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}
