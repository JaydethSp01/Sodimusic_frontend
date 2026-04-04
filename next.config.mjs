import path from "path";
import os from "os";
import { createHash } from "crypto";

const cwd = process.cwd();
const hasNonAscii = /[^\u0000-\u007f]/.test(cwd);
const isDev = process.env.NODE_ENV !== "production";

/**
 * En desarrollo, si la ruta del proyecto tiene caracteres no ASCII (p. ej. "Música"),
 * compilar en /tmp evita fallos esporádicos al servir chunks de `/_next/static/`.
 * En `next build` (producción) siempre se usa `.next` en el proyecto.
 */
const distDir =
  isDev && hasNonAscii
    ? path.join(os.tmpdir(), `next-dist-${createHash("sha256").update(cwd).digest("hex").slice(0, 16)}`)
    : ".next";

let uploadPatterns = [];
try {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? process.env.BACKEND_URL ?? "http://localhost:4000";
  const u = new URL(raw);
  uploadPatterns.push({
    protocol: u.protocol.replace(":", "") === "https" ? "https" : "http",
    hostname: u.hostname,
    pathname: "/uploads/**",
    ...(u.port ? { port: u.port } : {}),
  });
} catch {
  uploadPatterns = [];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "mosaic.scdn.co", pathname: "/**" },
      ...uploadPatterns,
    ],
  },
};

export default nextConfig;
