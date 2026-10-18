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

/**
 * Cabeceras de seguridad básicas. Sin CSP ni X-Frame-Options para no romper
 * los embeds de YouTube (iframes salientes no se ven afectados por estas
 * cabeceras) ni el admin (next-auth, uploads). `Permissions-Policy` deja
 * `fullscreen`/`picture-in-picture` para que los iframes de YouTube sigan
 * funcionando en pantalla completa.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self \"https://www.youtube.com\" \"https://www.youtube-nocookie.com\"), picture-in-picture=*",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [48, 64, 96, 128, 160, 256, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "**.fbcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "scontent*.xx.fbcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "mosaic.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com", pathname: "/**" },
      ...uploadPatterns,
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Estáticos propios en /public (favicons, fotos fijas): un día + SWR.
        source: "/:file(.+\\.(?:ico|png|jpg|jpeg|webp|avif|svg|woff2))",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
