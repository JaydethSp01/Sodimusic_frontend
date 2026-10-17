import { NextResponse } from "next/server";

const AUTH_COOKIE = /^(__Secure-|__Host-)?authjs\.(session-token|csrf-token|callback-url)(\.\d+)?$/;

/**
 * Cierre de sesión del admin. Vive fuera de `/admin/*` a propósito: el middleware de auth.js
 * vuelve a emitir la cookie de sesión en cada respuesta bajo ese matcher y anulaba el borrado.
 * Con estrategia JWT no hay sesión en servidor: expirar las cookies es cerrar la sesión.
 * Solo POST (un GET prefetchable cerraría sesión por accidente).
 */
export async function POST(request: Request): Promise<Response> {
  const res = NextResponse.redirect(new URL("/", request.url), 303);
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && AUTH_COOKIE.test(name)) {
      res.cookies.set({ name, value: "", path: "/", maxAge: 0, expires: new Date(0) });
    }
  }
  res.headers.set("Cache-Control", "no-store");
  return res;
}
