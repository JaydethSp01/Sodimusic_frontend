"use client";

import { useState, useMemo, useEffect, useRef, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { format, startOfTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useBookingStore } from "@/features/booking/stores/booking-store";
import {
  bookingStep2Schema,
  bookingStep4Schema,
  bookingStep5Schema,
  issuesToFieldErrors,
} from "@/features/booking/schemas/booking-schema";
import { createBookingSession } from "@/app/actions/booking-actions";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { LazyToaster } from "@/components/shared/lazy-toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { pageTransition } from "@/lib/animations";
import { getPublicApiUrl } from "@/lib/api";
import { formatCOP } from "@/lib/format-cop";
import { genreColor } from "@/lib/genre-colors";
import { TIME_SLOT_LABELS } from "@/lib/constants";
import type { ServiceType } from "@/types/enums";
import type { SiteContent, SiteLegal } from "@/types/site-content";
import { AlertTriangle, Check, Moon, Sun, Sunrise } from "lucide-react";
import "react-day-picker/style.css";
import type { DayPickerProps } from "react-day-picker";

export type BookingConfig = SiteContent["booking"];
export type BookingLegal = Pick<SiteLegal, "businessName" | "depositPercent" | "cancellationHours" | "policyVersion" | "ivaIncluded">;

type FieldErrors = Record<string, string>;

const TOTAL_STEPS = 5;

const bookingFieldClass =
  "mt-1 min-h-11 border border-white/10 bg-white/5 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 aria-[invalid=true]:border-red-400/70";

const genreChipBase =
  "inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Estilos del chip de género a partir de la paleta compartida (lib/genre-colors.ts). */
function genreChipStyle(genre: string, on: boolean): CSSProperties {
  const c = genreColor(genre);
  return on
    ? { color: c.fg, backgroundColor: c.bg, borderColor: c.fg }
    : { color: "var(--text-secondary)", borderColor: "rgba(255,255,255,0.1)" };
}

const DayPicker = dynamic<DayPickerProps>(() => import("react-day-picker").then((mod) => mod.DayPicker), {
  ssr: false,
  loading: () => (
    <div className="mx-auto h-[320px] w-full max-w-md animate-pulse rounded-lg border border-border bg-background-card" />
  ),
});

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-400">
      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

function StepIndicator({ step, labels }: { step: number; labels: string[] }) {
  const reduce = useReducedMotion();
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const currentLabel = labels[step - 1] ?? "";
  return (
    <div className="mb-8" aria-live="polite">
      {/* Móvil: "Paso X de 5 · Nombre" */}
      <div className="flex items-baseline justify-between gap-3 md:hidden">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
          Paso <span className="text-primary">{step}</span> de {TOTAL_STEPS}
          <span className="text-[var(--text-muted)]"> · </span>
          <span className="text-foreground">{currentLabel}</span>
        </p>
        {step < TOTAL_STEPS ? (
          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Luego: {labels[step]}</p>
        ) : null}
      </div>
      {/* Desktop: todos los pasos */}
      <ol className="hidden gap-4 md:flex md:justify-between" aria-label="Pasos de la reserva">
        {labels.map((l, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <li key={l} className="flex min-w-0 flex-1 flex-col items-center gap-2" aria-current={active ? "step" : undefined}>
              <m.div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs",
                  done && "border-primary bg-primary text-white",
                  active && "border-primary bg-primary/15 text-primary",
                  !done && !active && "border-white/10 text-[var(--text-muted)]",
                )}
                animate={active && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={active && !reduce ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : undefined}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : n}
                {done ? <span className="sr-only">{`Paso ${n} completado`}</span> : null}
              </m.div>
              <span
                className={cn(
                  "truncate text-center font-mono text-xs uppercase tracking-wider",
                  (done || active) && "text-primary",
                  !done && !active && "text-[var(--text-muted)]",
                )}
              >
                {l}
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded bg-background-elevated"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
      >
        <m.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.35 }}
        />
      </div>
    </div>
  );
}

function servicePriceLine(svc: BookingConfig["services"][number]): string | null {
  if (typeof svc.priceFromCOP !== "number" || svc.priceFromCOP <= 0) {
    return null;
  }
  const note = svc.priceNote?.trim();
  return `Desde ${formatCOP(svc.priceFromCOP)}${note ? ` · ${note}` : ""}`;
}

export function BookingWizard({ booking, legal }: { booking: BookingConfig; legal: BookingLegal }) {
  const s = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [occupied, setOccupied] = useState<string[]>([]);
  const [dayBlocked, setDayBlocked] = useState(false);
  const reduce = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);

  const api = getPublicApiUrl();
  const labels = booking.stepLabels.length >= TOTAL_STEPS ? booking.stepLabels : ["Servicio", "Tu música", "Fecha", "Contacto", "Confirmar"];

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function setAndClear<K extends Parameters<typeof s.setField>[0]>(key: K, value: Parameters<typeof s.setField<K>>[1]) {
    s.setField(key, value);
    clearError(key as string);
  }

  function focusFirstError(errs: FieldErrors) {
    const first = Object.keys(errs)[0];
    if (!first) {
      return;
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(first) ?? document.querySelector<HTMLElement>(`[data-field="${first}"]`);
      el?.focus({ preventScroll: false });
      el?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    });
  }

  useEffect(() => {
    if (!s.selectedDate) {
      return;
    }
    const key = format(s.selectedDate, "yyyy-MM-dd");
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${api}/api/booking/availability?date=${key}`);
        const data = (await r.json()) as { occupied: string[]; blocked: boolean };
        if (!cancelled) {
          setOccupied(data.occupied ?? []);
          setDayBlocked(!!data.blocked);
        }
      } catch {
        if (!cancelled) {
          setOccupied([]);
          setDayBlocked(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, s.selectedDate]);

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setMonth(to.getMonth() + 2);
    const q = `from=${format(from, "yyyy-MM-dd")}&to=${format(to, "yyyy-MM-dd")}`;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${api}/api/blocked-dates?${q}`);
        if (!r.ok) {
          return;
        }
        const data = (await r.json()) as { items: { dateKey: string; scope: string }[] };
        if (cancelled) {
          return;
        }
        const set = new Set<string>();
        for (const row of data.items) {
          if (row.scope === "DAY") {
            set.add(row.dateKey);
          }
        }
        setBlocked(set);
      } catch {
        /* sin bloqueos conocidos */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const isDayDisabled = useMemo(() => {
    return (d: Date) => {
      if (d.getDay() === 0) {
        return true;
      }
      if (d < startOfTomorrow()) {
        return true;
      }
      return blocked.has(format(d, "yyyy-MM-dd"));
    };
  }, [blocked]);

  function goTo(step: number) {
    setErrors({});
    s.setStep(step);
    topRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }

  function validateStep(step: number): FieldErrors {
    if (step === 1) {
      return s.serviceTypes.length === 0 ? { serviceTypes: "Elige al menos un servicio para continuar" } : {};
    }
    if (step === 2) {
      const r = bookingStep2Schema.safeParse({
        artisticName: s.artisticName,
        genres: s.genres,
        musicReference: s.musicReference,
        vision: s.vision || undefined,
        isFirstTime: s.isFirstTime,
      });
      return r.success ? {} : issuesToFieldErrors(r.error.issues);
    }
    if (step === 3) {
      if (!s.selectedDate) {
        return { selectedDate: "Elige una fecha en el calendario" };
      }
      if (dayBlocked) {
        return { selectedDate: "Ese día no está disponible. Elige otro." };
      }
      if (!s.selectedSlot) {
        return { selectedSlot: "Elige un horario" };
      }
      if (occupied.includes(s.selectedSlot)) {
        return { selectedSlot: "Ese horario ya está ocupado. Elige otro." };
      }
      return {};
    }
    if (step === 4) {
      const r = bookingStep4Schema.safeParse({
        fullName: s.fullName,
        phone: s.phone,
        email: s.email,
        instagram: s.instagram || undefined,
      });
      return r.success ? {} : issuesToFieldErrors(r.error.issues);
    }
    if (step === 5) {
      const r = bookingStep5Schema.safeParse({
        isAdult: s.isAdult ?? undefined,
        policyAccepted: s.policyAccepted,
        cancellationAccepted: s.cancellationAccepted,
      });
      return r.success ? {} : issuesToFieldErrors(r.error.issues);
    }
    return {};
  }

  function goNext() {
    const errs = validateStep(s.step);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    goTo(Math.min(TOTAL_STEPS, s.step + 1));
  }

  async function onConfirm() {
    if (s.serviceTypes.length === 0 || !s.selectedDate || !s.selectedSlot) {
      return;
    }
    const errs = validateStep(5);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setLoading(true);
    const payload = {
      serviceTypes: s.serviceTypes,
      artisticName: s.artisticName,
      fullName: s.fullName,
      genres: s.genres,
      musicReference: s.musicReference,
      vision: s.vision || null,
      isFirstTime: s.isFirstTime,
      scheduledDate: s.selectedDate.toISOString(),
      timeSlot: s.selectedSlot,
      phone: s.phone,
      email: s.email,
      instagram: s.instagram,
      acceptPolicy: s.cancellationAccepted,
      policyAccepted: s.policyAccepted,
      policyVersion: legal.policyVersion,
      marketingOptIn: s.marketingOptIn,
      isAdult: s.isAdult === true,
    };
    const result = await createBookingSession(payload);
    setLoading(false);
    if (result && "ok" in result && result.ok === false) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length) {
        setErrors(result.fieldErrors);
      } else {
        setErrors({ form: result.error });
      }
      toast.error(result.error);
    }
  }

  const slotOptions = [
    { slot: "morning" as const, icon: Sunrise, label: "Mañana", sub: "9am – 12pm" },
    { slot: "afternoon" as const, icon: Sun, label: "Tarde", sub: "2pm – 6pm" },
    { slot: "night" as const, icon: Moon, label: "Noche", sub: "7pm – 10pm" },
  ] as const;

  const selectedServices = booking.services.filter((x) => s.serviceTypes.includes(x.type as ServiceType));
  const depositPercent = Math.max(0, Math.min(100, legal.depositPercent ?? 0));
  const cancellationHours = legal.cancellationHours ?? 24;

  return (
    <LazyMotion features={domAnimation}>
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-24 px-4 py-8 sm:py-12">
      <LazyToaster />
      <StepIndicator step={s.step} labels={labels} />
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={s.step}
          initial={reduce ? false : "initial"}
          animate="animate"
          exit={reduce ? undefined : "exit"}
          variants={pageTransition}
        >
          {s.step === 1 && (
            <fieldset
              className="space-y-3"
              data-field="serviceTypes"
              tabIndex={-1}
              aria-invalid={errors.serviceTypes ? true : undefined}
              aria-describedby={errors.serviceTypes ? "serviceTypes-error" : "serviceTypes-hint"}
            >
              <legend className="sr-only">Servicios</legend>
              <p id="serviceTypes-hint" className="font-mono text-xs text-[var(--text-muted)]">
                Puedes seleccionar uno o varios servicios para la misma sesión.
                {legal.ivaIncluded ? " Precios en COP, IVA incluido." : ""}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {booking.services.map((svc, idx) => {
                  const type = svc.type as ServiceType;
                  const selected = s.serviceTypes.includes(type);
                  const n = String(idx + 1).padStart(2, "0");
                  const price = servicePriceLine(svc);
                  return (
                    <button
                      key={svc.type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setAndClear(
                          "serviceTypes",
                          selected ? s.serviceTypes.filter((current) => current !== type) : [...s.serviceTypes, type],
                        )
                      }
                      className={cn(
                        "relative min-h-11 overflow-hidden rounded-lg border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        selected
                          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,107,0,0.2)]"
                          : "border-border bg-background-card hover:border-primary/35",
                        errors.serviceTypes && "border-red-400/50",
                      )}
                    >
                      <span className="pointer-events-none absolute -right-1 -top-3 font-display text-[72px] leading-none text-white/[0.04]" aria-hidden>
                        {n}
                      </span>
                      <div className="relative flex items-start justify-between gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-2xl" aria-hidden>
                          {svc.icon}
                        </span>
                        <AnimatePresence>
                          {selected ? (
                            <m.span
                              key="chk"
                              initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reduce ? undefined : { opacity: 0, scale: 0.5 }}
                              className="rounded-full bg-primary/20 p-1"
                            >
                              <Check className="h-5 w-5 text-primary" aria-hidden />
                            </m.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <p className="relative mt-3 font-display text-lg">{svc.title}</p>
                      <p className="relative text-sm text-[var(--text-secondary)]">{svc.desc}</p>
                      {price ? (
                        <p className="relative mt-3 inline-flex rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
                          {price}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <FieldError id="serviceTypes-error" message={errors.serviceTypes} />
            </fieldset>
          )}

          {s.step === 2 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="artisticName">¿Cómo te llaman?</Label>
                <Input
                  id="artisticName"
                  autoComplete="nickname"
                  value={s.artisticName}
                  onChange={(e) => setAndClear("artisticName", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.artisticName ? true : undefined}
                  aria-describedby={errors.artisticName ? "artisticName-error" : undefined}
                />
                <FieldError id="artisticName-error" message={errors.artisticName} />
              </div>
              <fieldset
                data-field="genres"
                tabIndex={-1}
                aria-invalid={errors.genres ? true : undefined}
                aria-describedby={errors.genres ? "genres-error" : undefined}
                className="rounded-md focus-visible:outline-none"
              >
                <legend className="text-sm font-medium">Géneros</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.genreChips.map((g) => {
                    const on = s.genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setAndClear("genres", on ? s.genres.filter((x) => x !== g) : [...s.genres, g])}
                        className={genreChipBase}
                        style={genreChipStyle(g, on)}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="genres-error" message={errors.genres} />
              </fieldset>
              <div>
                <Label htmlFor="musicReference">¿A qué artista o canción te pareces o quieres sonar?</Label>
                <Input
                  id="musicReference"
                  type="url"
                  inputMode="url"
                  placeholder="https://open.spotify.com/track/... o https://youtu.be/..."
                  value={s.musicReference}
                  onChange={(e) => setAndClear("musicReference", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.musicReference ? true : undefined}
                  aria-describedby={errors.musicReference ? "musicReference-error" : "musicReference-hint"}
                />
                {!errors.musicReference ? (
                  <p id="musicReference-hint" className="mt-1 text-xs text-[var(--text-muted)]">
                    Un enlace de Spotify, YouTube o SoundCloud.
                  </p>
                ) : null}
                <FieldError id="musicReference-error" message={errors.musicReference} />
              </div>
              <div>
                <Label htmlFor="vision">Cuéntanos tu visión para esta sesión (opcional)</Label>
                <Textarea
                  id="vision"
                  maxLength={500}
                  value={s.vision}
                  onChange={(e) => setAndClear("vision", e.target.value)}
                  className={cn(bookingFieldClass, "min-h-[100px] resize-y")}
                  aria-invalid={errors.vision ? true : undefined}
                  aria-describedby={errors.vision ? "vision-error" : "vision-count"}
                />
                <p id="vision-count" className="mt-1 text-right font-mono text-xs text-[var(--text-muted)]">
                  {s.vision.length}/500
                </p>
                <FieldError id="vision-error" message={errors.vision} />
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="¿Es tu primera vez con Sodimusic?">
                <Button
                  type="button"
                  className="min-h-11"
                  variant={s.isFirstTime ? "default" : "outline"}
                  onClick={() => s.setField("isFirstTime", true)}
                  aria-pressed={s.isFirstTime}
                >
                  Primera vez
                </Button>
                <Button
                  type="button"
                  className="min-h-11"
                  variant={!s.isFirstTime ? "default" : "outline"}
                  onClick={() => s.setField("isFirstTime", false)}
                  aria-pressed={!s.isFirstTime}
                >
                  Ya he trabajado con Sodimusic
                </Button>
              </div>
            </div>
          )}

          {s.step === 3 && (
            <div className="space-y-4">
              <div
                data-field="selectedDate"
                tabIndex={-1}
                aria-invalid={errors.selectedDate ? true : undefined}
                aria-describedby={errors.selectedDate ? "selectedDate-error" : undefined}
                className="rounded-lg focus-visible:outline-none"
              >
                <DayPicker
                  mode="single"
                  selected={s.selectedDate ?? undefined}
                  onSelect={(d) => {
                    setAndClear("selectedDate", d ?? null);
                    setAndClear("selectedSlot", null);
                  }}
                  locale={es}
                  disabled={isDayDisabled}
                  className={cn(
                    "booking-calendar mx-auto rounded-lg border bg-background-card p-4",
                    errors.selectedDate ? "border-red-400/60" : "border-border",
                  )}
                  style={
                    {
                      "--rdp-accent-color": "var(--primary)",
                      "--rdp-accent-background-color": "rgba(255, 107, 0, 0.18)",
                      "--rdp-disabled-opacity": "0.3",
                    } as CSSProperties
                  }
                />
                <FieldError id="selectedDate-error" message={errors.selectedDate} />
              </div>
              {s.selectedDate ? (
                <div
                  className="space-y-2"
                  role="radiogroup"
                  aria-label="Horarios"
                  data-field="selectedSlot"
                  tabIndex={-1}
                  aria-invalid={errors.selectedSlot ? true : undefined}
                  aria-describedby={errors.selectedSlot ? "selectedSlot-error" : undefined}
                >
                  <p className="font-mono text-xs text-[var(--text-muted)]">Horarios</p>
                  {slotOptions.map(({ slot, icon: Icon, label, sub }) => {
                    const disabled = dayBlocked || occupied.includes(slot);
                    const sel = s.selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        disabled={disabled}
                        onClick={() => setAndClear("selectedSlot", slot)}
                        className={cn(
                          "relative flex min-h-[72px] w-full items-center gap-4 overflow-hidden rounded-lg border px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          disabled && "cursor-not-allowed opacity-40",
                          sel
                            ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,107,0,0.25)]"
                            : "border-border bg-background-secondary hover:border-primary/30",
                        )}
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-lg text-foreground">{label}</span>
                          <span className="mt-0.5 block font-mono text-xs text-[var(--text-muted)]">{sub}</span>
                        </span>
                        {disabled ? (
                          <span className="font-mono text-xs text-[var(--text-muted)]">No disponible</span>
                        ) : sel ? (
                          <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })}
                  <FieldError id="selectedSlot-error" message={errors.selectedSlot} />
                </div>
              ) : null}
            </div>
          )}

          {s.step === 4 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  value={s.fullName}
                  onChange={(e) => setAndClear("fullName", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.fullName ? true : undefined}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                <FieldError id="fullName-error" message={errors.fullName} />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+57 300 000 0000"
                  value={s.phone}
                  onChange={(e) => setAndClear("phone", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                <FieldError id="phone-error" message={errors.phone} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={s.email}
                  onChange={(e) => setAndClear("email", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram (opcional, sin @)</Label>
                <Input
                  id="instagram"
                  placeholder="tunombre"
                  value={s.instagram}
                  onChange={(e) => setAndClear("instagram", e.target.value)}
                  className={bookingFieldClass}
                  aria-invalid={errors.instagram ? true : undefined}
                  aria-describedby={errors.instagram ? "instagram-error" : undefined}
                />
                <FieldError id="instagram-error" message={errors.instagram} />
              </div>
            </div>
          )}

          {s.step === 5 && s.serviceTypes.length > 0 && s.selectedDate && s.selectedSlot && (
            <div className="space-y-6">
              <section className="space-y-4 rounded-lg border border-border bg-background-card p-5 sm:p-6" aria-labelledby="summary-title">
                <h2 id="summary-title" className="font-display text-2xl tracking-wide text-foreground">
                  Resumen de tu sesión
                </h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Servicios</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {selectedServices.map((svc) => {
                        const price = servicePriceLine(svc);
                        return (
                          <span
                            key={svc.type}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-muted px-3 py-1.5 font-mono text-xs text-primary"
                          >
                            {svc.title}
                            {price ? <span className="text-[10px] text-primary/70">{price}</span> : null}
                          </span>
                        );
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Fecha y horario</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      <span className="block capitalize">{format(s.selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
                      <span className="block font-mono text-xs text-[var(--text-secondary)]">{TIME_SLOT_LABELS[s.selectedSlot]}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Artista</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      <strong>{s.artisticName}</strong>
                      <span className="block text-xs text-[var(--text-secondary)]">{s.genres.join(", ")}</span>
                      <a
                        href={s.musicReference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex min-h-11 items-center text-xs text-primary underline underline-offset-2"
                      >
                        Ver referencia musical
                      </a>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Contacto</dt>
                    <dd className="mt-1 break-words text-sm text-foreground">
                      {s.fullName} · {s.email} · {s.phone}
                      {s.instagram ? ` · @${s.instagram.replace(/^@/, "")}` : ""}
                    </dd>
                  </div>
                  {s.vision ? (
                    <div className="sm:col-span-2">
                      <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Tu visión</dt>
                      <dd className="mt-1 whitespace-pre-line text-sm text-[var(--text-secondary)]">{s.vision}</dd>
                    </div>
                  ) : null}
                </dl>
                <Button type="button" variant="link" className="h-11 px-0" onClick={() => goTo(1)}>
                  Editar datos
                </Button>
              </section>

              <section className="space-y-4 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-5 sm:p-6" aria-labelledby="terms-title">
                <h2 id="terms-title" className="font-display text-xl tracking-wide text-foreground">
                  Anticipo y cancelación
                </h2>
                <ul className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {depositPercent > 0 ? (
                    <li>
                      Para reservar la fecha se solicita un anticipo del <strong className="text-foreground">{depositPercent}%</strong> del valor
                      de la sesión; el saldo se paga el día de la sesión.
                    </li>
                  ) : (
                    <li>No se requiere anticipo para reservar; el pago se realiza el día de la sesión.</li>
                  )}
                  <li>
                    Puedes cancelar o reprogramar sin costo con al menos{" "}
                    <strong className="text-foreground">{cancellationHours} h</strong> de anticipación. Después de ese plazo el anticipo no se
                    reembolsa.
                  </li>
                  <li>
                    Condiciones completas en los{" "}
                    <Link href="/legal/terminos-estudio" target="_blank" className="text-primary underline underline-offset-2">
                      Términos del estudio
                    </Link>
                    .
                  </li>
                </ul>
                <div>
                  <label htmlFor="cancellationAccepted" className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <Checkbox
                      id="cancellationAccepted"
                      checked={s.cancellationAccepted}
                      onCheckedChange={(v) => setAndClear("cancellationAccepted", v === true)}
                      aria-required
                      aria-invalid={errors.cancellationAccepted ? true : undefined}
                      aria-describedby={errors.cancellationAccepted ? "cancellationAccepted-error" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0"
                    />
                    <span>
                      Entiendo la política de anticipo y que puedo cancelar o reprogramar con al menos {cancellationHours} h de anticipación.{" "}
                      <span className="text-[var(--text-muted)]">(obligatorio)</span>
                    </span>
                  </label>
                  <FieldError id="cancellationAccepted-error" message={errors.cancellationAccepted} />
                </div>
              </section>

              <fieldset
                className="space-y-3 rounded-lg border border-border bg-background-card p-5 sm:p-6"
                data-field="isAdult"
                tabIndex={-1}
                aria-invalid={errors.isAdult ? true : undefined}
                aria-describedby={errors.isAdult ? "isAdult-error" : "isAdult-hint"}
              >
                <legend className="font-display text-xl tracking-wide text-foreground">¿Eres mayor de 18 años?</legend>
                <p id="isAdult-hint" className="text-xs text-[var(--text-muted)]">
                  Lo necesitamos para saber si la sesión requiere autorización de un acudiente.
                </p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="¿Eres mayor de 18 años?">
                  {[
                    { value: true, label: "Sí, soy mayor de edad" },
                    { value: false, label: "No, soy menor de edad" },
                  ].map((opt) => {
                    const on = s.isAdult === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setAndClear("isAdult", opt.value)}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          on ? "border-primary bg-primary/15 text-primary" : "border-border text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="isAdult-error" message={errors.isAdult} />
                {s.isAdult === false ? (
                  <p role="status" className="flex items-start gap-2 rounded-md border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-2 text-sm leading-relaxed text-[var(--gold)]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      Si eres menor de edad, la sesión requiere autorización escrita y acompañamiento de tu padre, madre o acudiente. Te
                      contactaremos para coordinarlo; puedes continuar con la reserva.
                    </span>
                  </p>
                ) : null}
              </fieldset>

              <section className="space-y-3 rounded-lg border border-border bg-background-card p-5 sm:p-6" aria-label="Datos personales">
                <ConsentCheckbox
                  checked={s.policyAccepted}
                  onCheckedChange={(v) => setAndClear("policyAccepted", v)}
                  businessName={legal.businessName}
                  error={errors.policyAccepted}
                />
                <ConsentCheckbox
                  variant="marketing"
                  checked={s.marketingOptIn}
                  onCheckedChange={(v) => s.setField("marketingOptIn", v)}
                  businessName={legal.businessName}
                />
              </section>

              {errors.form ? (
                <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errors.form}
                </p>
              ) : null}
            </div>
          )}
        </m.div>
      </AnimatePresence>

      <div className={cn("mt-8 flex gap-3", s.step === 1 ? "justify-end" : "justify-between")}>
        {s.step > 1 ? (
          <Button type="button" variant="outline" className="h-12 min-w-[120px]" onClick={() => goTo(Math.max(1, s.step - 1))}>
            Anterior
          </Button>
        ) : null}
        {s.step < TOTAL_STEPS ? (
          <Button type="button" className="h-12 min-w-[140px]" onClick={goNext}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" className="h-12 min-w-[160px]" disabled={loading} onClick={() => void onConfirm()}>
            {loading ? "Enviando…" : "Confirmar sesión"}
          </Button>
        )}
      </div>
    </div>
    </LazyMotion>
  );
}
