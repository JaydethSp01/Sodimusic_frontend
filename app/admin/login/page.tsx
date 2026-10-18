"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { AdminField } from "@/features/admin/components/admin-primitives";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Credenciales incorrectas. Revisa el email y la contraseña.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-0 px-4 py-12">
      {/* Fondo: luz de pico arriba a la izquierda + grano. Sin movimiento. */}
      <div className="grain pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_15%_0%,rgba(217,166,42,0.22),transparent_60%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(79,209,197,0.07),transparent_60%)]" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-start">
          <Link href="/" className="inline-flex items-center rounded font-display text-title font-black uppercase tracking-wordmark text-text-1 [font-stretch:125%] transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0">
            Sodimusic
          </Link>
          <Heading as="h1" size="display-md" className="mt-6">
            Panel <em>admin</em>
          </Heading>
          <Text size="body" tone="2" className="mt-3">
            Acceso restringido al equipo. Usa las credenciales autorizadas.
          </Text>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5 rounded-lg border border-line-1 bg-ink-2 p-6 shadow-card sm:p-8" noValidate>
          <AdminField label="Email" htmlFor="email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" strokeWidth={1.75} aria-hidden />
              <Input id="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
            </div>
          </AdminField>

          <AdminField label="Contraseña" htmlFor="password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" strokeWidth={1.75} aria-hidden />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-12"
              />
              <IconButton
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </IconButton>
            </div>
          </AdminField>

          {error ? (
            <div className="rounded border border-danger/40 bg-danger/[0.08] px-3 py-2" aria-live="polite">
              <FieldError className="mt-0">{error}</FieldError>
            </div>
          ) : null}

          <Button type="submit" size="lg" className="w-full" loading={loading} aria-label="Iniciar sesión en el panel">
            {loading ? "Entrando…" : "Entrar al panel"}
          </Button>
        </form>

        <p className="mt-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded text-body-sm text-text-2 transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Volver al sitio público
          </Link>
        </p>
      </div>
    </main>
  );
}
