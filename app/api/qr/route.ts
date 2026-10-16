import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { getSiteContent } from "@/lib/site-config-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEX = /^[0-9a-f]{6}$/i;

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = raw == null || raw === "" ? NaN : Number(raw);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(n)));
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * GET /api/qr?url=&size=&format=svg|png&fg=&bg=&margin=&download=1
 * Genera un QR (nivel M) hacia `url` (por defecto `site.qr.targetUrl` o NEXT_PUBLIC_SITE_URL).
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  let url = sp.get("url")?.trim() ?? "";
  if (!url) {
    const site = await getSiteContent().catch(() => null);
    url = site?.qr.targetUrl?.trim() || (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  }
  if (!url || !isHttpUrl(url)) {
    return NextResponse.json({ error: "Parámetro `url` inválido: debe ser una URL http(s)." }, { status: 400 });
  }

  const size = clampInt(sp.get("size"), 512, 128, 2048);
  const margin = clampInt(sp.get("margin"), 2, 0, 8);
  const format = sp.get("format")?.toLowerCase() === "svg" ? "svg" : "png";
  const fgRaw = sp.get("fg")?.replace(/^#/, "") ?? "000000";
  const bgRaw = sp.get("bg")?.replace(/^#/, "") ?? "ffffff";
  if (!HEX.test(fgRaw) || !HEX.test(bgRaw)) {
    return NextResponse.json({ error: "Colores `fg`/`bg` inválidos: usa hex de 6 dígitos sin `#`." }, { status: 400 });
  }
  const download = sp.get("download") === "1";

  const options = {
    errorCorrectionLevel: "M" as const,
    margin,
    width: size,
    color: { dark: `#${fgRaw}`, light: `#${bgRaw}` },
  };

  const headers = new Headers({
    "Cache-Control": "public, max-age=3600",
  });
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="sodimusic-qr.${format}"`);
  }

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(url, { ...options, type: "svg" });
      headers.set("Content-Type", "image/svg+xml; charset=utf-8");
      return new NextResponse(svg, { status: 200, headers });
    }
    const png = await QRCode.toBuffer(url, { ...options, type: "png" });
    headers.set("Content-Type", "image/png");
    headers.set("Content-Length", String(png.byteLength));
    return new NextResponse(new Uint8Array(png), { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "No se pudo generar el código QR." }, { status: 500 });
  }
}
