"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Fondo: malla + viñeta (respeta prefers-reduced-motion vía motion-reduce) */}
      <div className="pointer-events-none absolute inset-0 bg-[#050508]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,107,0,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(212,160,23,0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div
        className={cn(
          "pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-[100px] motion-safe:animate-login-blob motion-reduce:animate-none",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-24 bottom-1/4 h-[22rem] w-[22rem] rounded-full bg-gold/20 blur-[90px] motion-safe:animate-login-blob motion-reduce:animate-none [animation-delay:-7s]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-950/40 blur-[80px] motion-safe:animate-login-blob motion-reduce:animate-none [animation-delay:-12s]",
        )}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050508_75%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px] motion-safe:animate-login-fade-in motion-reduce:opacity-100">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_-8px_rgba(255,107,0,0.45)] backdrop-blur-sm">
            <Shield className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.35em] text-primary/90">
            Sodimusic
          </p>
          <h1 className="mt-2 font-display text-3xl font-normal tracking-wide text-foreground">
            Panel admin
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
            Acceso restringido al equipo. Usa las credenciales autorizadas.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-5 rounded-2xl border border-white/[0.08] bg-black/35 p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[var(--text-secondary)]">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-white/10 bg-black/40 pl-10 text-[15px] placeholder:text-[var(--text-muted)] focus-visible:border-primary/40 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[var(--text-secondary)]">
              Contraseña
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-white/10 bg-black/40 pl-10 pr-11 text-[15px] placeholder:text-[var(--text-muted)] focus-visible:border-primary/40 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0c]"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div
              className="flex gap-3 rounded-lg border border-red-500/25 bg-red-950/40 px-3 py-3 text-sm text-red-200"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full rounded-lg text-[15px] font-medium shadow-[0_8px_32px_-4px_rgba(255,107,0,0.35)]"
            disabled={loading}
            aria-label="Iniciar sesión en el panel"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Entrando…
              </>
            ) : (
              "Entrar al panel"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
          <Link
            href="/"
            className="text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← Volver al sitio público
          </Link>
        </p>
      </div>
    </div>
  );
}
