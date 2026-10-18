"use client";

import { useState, useMemo, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
import { FeatureRow } from "@/components/ds/feature-row";
import { FormField } from "@/components/ds/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { FieldError } from "@/components/ui/field-error";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getPublicApiUrl } from "@/lib/api";
import { serviceIcon } from "@/lib/service-icons";
import { TIME_SLOT_LABELS } from "@/lib/constants";
import type { ServiceType } from "@/types/enums";
import type { SiteContent, SiteLegal } from "@/types/site-content";
import { AlertTriangle, CalendarDays, Check, ChevronDown, Moon, Sun, Sunrise } from "lucide-react";
import "react-day-picker/style.css";
import type { DayPickerProps } from "react-day-picker";

export type BookingConfig = SiteContent["booking"];
export type BookingLegal = Pick<SiteLegal, "businessName" | "depositPercent" | "cancellationHours" | "policyVersion" | "ivaIncluded">;

type FieldErrors = Record<string, string>;

const TOTAL_STEPS = 5;

const DayPicker = dynamic<DayPickerProps>(() => import("react-day-picker").then((mod) => mod.DayPicker), {
  ssr: false,
  loading: () => <div className="mx-auto h-[320px] w-full max-w-md animate-pulse rounded-lg border border-line-1 bg-ink-2" />,
});

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/**
 * Stepper: en móvil «Paso X de 5 · Nombre» + barra; en escritorio lista vertical con número, línea y
 * estado (hecho / activo / pendiente). Un único `progressbar` para ambos.
 */
function StepIndicator({ step, labels }: { step: number; labels: string[] }) {
  const currentLabel = labels[step - 1] ?? "";
  return (
    <div aria-live="polite">
      <div className="flex items-baseline justify-between gap-3 lg:hidden">
        <p className="text-label text-text-2">
          Paso <span className="text-fire-400">{step}</span> de {TOTAL_STEPS}
          <span className="text-text-3"> · </span>
          <span className="text-text-1">{currentLabel}</span>
        </p>
        {step < TOTAL_STEPS ? <p className="truncate text-label text-text-3">Luego: {labels[step]}</p> : null}
      </div>
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-3 lg:mt-0"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
      >
        <div
          className="h-full bg-fire-500 transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
      <ol className="mt-6 hidden lg:block" aria-label="Pasos de la reserva">
        {labels.map((l, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          const last = i === labels.length - 1;
          return (
            <li key={l} className="relative flex items-center gap-4 pb-6 last:pb-0" aria-current={active ? "step" : undefined}>
              {!last ? (
                <span
                  className={cn("absolute left-[17px] top-9 h-[calc(100%-20px)] w-px", done ? "bg-fire-500" : "bg-line-2")}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-label",
                  done && "border-fire-500 bg-fire-500 text-fire-on",
                  active && "border-fire-500 bg-fire-500/[0.12] text-fire-300 shadow-fire",
                  !done && !active && "border-line-2 text-text-3",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : n}
                {done ? <span className="sr-only">{`Paso ${n} completado`}</span> : null}
              </span>
              <span className={cn("text-body font-semibold", active ? "text-text-1" : done ? "text-text-2" : "text-text-3")}>{l}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function servicePriceLine(svc: BookingConfig["services"][number]): string | null {
  if (typeof svc.priceFromCOP !== "number" || svc.priceFromCOP <= 0) {
    return null;
  }
  const note = svc.priceNote?.trim();
  return `Desde ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(svc.priceFromCOP)}${note ? ` · ${note}` : ""}`;
}

/** Resumen vivo de la reserva (columna izquierda en escritorio, plegable en móvil). */
function BookingSummary({
  services,
  date,
  slot,
  depositPercent,
  cancellationHours,
}: {
  services: BookingConfig["services"];
  date: Date | null;
  slot: string | null;
  depositPercent: number;
  cancellationHours: number;
}) {
  return (
    <dl className="space-y-4">
      <div>
        <dt className="text-label text-text-3">Servicios</dt>
        <dd className="mt-1.5">
          {services.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {services.map((svc) => (
                <li key={svc.type}>
                  <Badge tone="fire" size="md">
                    {svc.title}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <Text as="span" size="body-sm" tone="3">
              Por elegir
            </Text>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-label text-text-3">Fecha y horario</dt>
        <dd className="mt-1.5 text-body-sm text-text-1">
          {date ? (
            <>
              <span className="block capitalize">{format(date, "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
              <span className="block font-mono text-label text-text-2">{slot ? TIME_SLOT_LABELS[slot] : "Horario por elegir"}</span>
            </>
          ) : (
            <Text as="span" size="body-sm" tone="3">
              Por elegir
            </Text>
          )}
        </dd>
      </div>
      <div className="border-t border-line-1 pt-4">
        <dt className="text-label text-text-3">Anticipo</dt>
        <dd className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge tone="gold" variant="solid" size="md">
            {depositPercent > 0 ? `${depositPercent}% para confirmar` : "Sin anticipo"}
          </Badge>
          <Text as="span" size="body-sm" tone="3">
            Reprograma gratis con {cancellationHours} h
          </Text>
        </dd>
      </div>
    </dl>
  );
}

export function BookingWizard({ booking, legal }: { booking: BookingConfig; legal: BookingLegal }) {
  const s = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [occupied, setOccupied] = useState<string[]>([]);
  const [dayBlocked, setDayBlocked] = useState(false);
  const reduce = usePrefersReducedMotion();
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

  const summary = (
    <BookingSummary
      services={selectedServices}
      date={s.selectedDate}
      slot={s.selectedSlot}
      depositPercent={depositPercent}
      cancellationHours={cancellationHours}
    />
  );

  const stepTitle: Record<number, { title: string; lead: ReactNode }> = {
    1: { title: "¿Qué vamos a hacer?", lead: `Puedes seleccionar uno o varios servicios para la misma sesión.${legal.ivaIncluded ? " Precios en COP, IVA incluido." : ""}` },
    2: { title: "Cuéntanos tu música", lead: "Nombre artístico, géneros y una referencia de cómo quieres sonar." },
    3: { title: "Elige fecha y horario", lead: "Trabajamos de lunes a sábado. Los días en gris ya están ocupados." },
    4: { title: "¿Cómo te contactamos?", lead: "Te confirmamos por WhatsApp y por correo." },
    5: { title: "Revisa y confirma", lead: "Comprueba los datos, acepta la política de anticipo y envía la solicitud." },
  };

  return (
    <div ref={topRef} className="container-page scroll-mt-24 py-10 lg:py-16">
      <LazyToaster />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--nav-h,72px)+24px)] lg:self-start">
          <StepIndicator step={s.step} labels={labels} />
          {/* Resumen: plegable en móvil, tarjeta fija en escritorio */}
          <details className="group/sum mt-4 rounded-lg border border-line-1 bg-ink-2 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-body font-semibold text-text-1 [&::-webkit-details-marker]:hidden">
              Tu reserva
              <ChevronDown className="h-5 w-5 text-text-3 transition-transform duration-200 group-open/sum:rotate-180" strokeWidth={1.75} aria-hidden />
            </summary>
            <div className="border-t border-line-1 px-4 py-4">{summary}</div>
          </details>
          <div className="mt-8 hidden rounded-lg border border-line-1 bg-ink-2 p-5 lg:block">
            <Heading as="p" size="display-sm" className="mb-5">
              Tu reserva
            </Heading>
            {summary}
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8">
          <div key={s.step} className={cn(!reduce && "hero-enter")}>
            <div className="mb-8">
              <Heading as="h2" size="display-md">
                {stepTitle[s.step]?.title}
              </Heading>
              <Text as="p" size="body" tone="2" prose className="mt-3">
                {stepTitle[s.step]?.lead}
              </Text>
            </div>

            {s.step === 1 && (
              <fieldset
                className={cn("rounded-lg focus-visible:outline-none", errors.serviceTypes && "border border-danger/50 px-3")}
                data-field="serviceTypes"
                tabIndex={-1}
                aria-invalid={errors.serviceTypes ? true : undefined}
                aria-describedby={errors.serviceTypes ? "serviceTypes-error" : undefined}
              >
                <legend className="sr-only">Servicios</legend>
                <div className="border-t border-line-1">
                  {booking.services.map((svc, idx) => {
                    const type = svc.type as ServiceType;
                    const selected = s.serviceTypes.includes(type);
                    const Icon = serviceIcon(svc.type);
                    const price = typeof svc.priceFromCOP === "number" && svc.priceFromCOP > 0 ? svc.priceFromCOP : null;
                    return (
                      <FeatureRow
                        key={svc.type}
                        index={idx + 1}
                        selected={selected}
                        className={cn(
                          "rounded px-2 transition-colors duration-150 focus-within:bg-fire-500/[0.06] focus-within:ring-2 focus-within:ring-fire-500",
                          selected && "bg-fire-500/[0.06]",
                        )}
                        title={
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setAndClear(
                                "serviceTypes",
                                selected ? s.serviceTypes.filter((current) => current !== type) : [...s.serviceTypes, type],
                              )
                            }
                            className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-left focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                                selected ? "border-fire-500 bg-fire-500 text-fire-on" : "border-line-2 bg-ink-2 text-fire-400",
                              )}
                            >
                              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </span>
                            <span>{svc.title}</span>
                          </button>
                        }
                        description={svc.desc}
                        aside={
                          <span className="flex items-center gap-3">
                            {price ? (
                              <span className="hidden sm:inline-flex">
                                <Price amount={price} size="sm" prefix="desde" />
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-150",
                                selected ? "border-fire-500 bg-fire-500 text-fire-on" : "border-line-2 text-transparent",
                              )}
                              aria-hidden
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          </span>
                        }
                      />
                    );
                  })}
                </div>
                <FieldError id="serviceTypes-error">{errors.serviceTypes}</FieldError>
              </fieldset>
            )}

            {s.step === 2 && (
              <div className="space-y-6">
                <FormField id="artisticName" label="¿Cómo te llaman?" error={errors.artisticName}>
                  <Input autoComplete="nickname" value={s.artisticName} onChange={(e) => setAndClear("artisticName", e.target.value)} />
                </FormField>
                <fieldset
                  data-field="genres"
                  tabIndex={-1}
                  aria-invalid={errors.genres ? true : undefined}
                  aria-describedby={errors.genres ? "genres-error" : undefined}
                  className="rounded focus-visible:outline-none"
                >
                  <legend className="text-body-sm font-medium text-text-1">Géneros</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.genreChips.map((g) => {
                      const on = s.genres.includes(g);
                      return (
                        <Chip key={g} selected={on} onClick={() => setAndClear("genres", on ? s.genres.filter((x) => x !== g) : [...s.genres, g])}>
                          {g}
                        </Chip>
                      );
                    })}
                  </div>
                  <FieldError id="genres-error">{errors.genres}</FieldError>
                </fieldset>
                <FormField
                  id="musicReference"
                  label="¿A qué artista o canción te pareces o quieres sonar?"
                  hint={errors.musicReference ? undefined : "Un enlace de Spotify, YouTube o SoundCloud."}
                  error={errors.musicReference}
                >
                  <Input
                    type="url"
                    inputMode="url"
                    placeholder="https://open.spotify.com/track/... o https://youtu.be/..."
                    value={s.musicReference}
                    onChange={(e) => setAndClear("musicReference", e.target.value)}
                  />
                </FormField>
                <FormField
                  id="vision"
                  label="Cuéntanos tu visión para esta sesión (opcional)"
                  hint={<span className="block text-right font-mono tabular-nums">{s.vision.length}/500</span>}
                  error={errors.vision}
                >
                  <Textarea maxLength={500} value={s.vision} onChange={(e) => setAndClear("vision", e.target.value)} className="min-h-[120px] resize-y" />
                </FormField>
                <div className="flex flex-wrap gap-2" role="group" aria-label="¿Es tu primera vez con Sodimusic?">
                  <Chip selected={s.isFirstTime} onClick={() => s.setField("isFirstTime", true)}>
                    Primera vez
                  </Chip>
                  <Chip selected={!s.isFirstTime} onClick={() => s.setField("isFirstTime", false)}>
                    Ya he trabajado con Sodimusic
                  </Chip>
                </div>
              </div>
            )}

            {s.step === 3 && (
              <div className="grid gap-6 md:grid-cols-2 md:items-start">
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
                      "booking-calendar mx-auto rounded-lg border bg-ink-2 p-4 text-text-1 shadow-card",
                      errors.selectedDate ? "border-danger/60" : "border-line-1",
                    )}
                    style={
                      {
                        "--rdp-accent-color": "var(--fire-500)",
                        "--rdp-accent-background-color": "rgba(255, 107, 0, 0.18)",
                        "--rdp-disabled-opacity": "0.3",
                      } as CSSProperties
                    }
                  />
                  <FieldError id="selectedDate-error">{errors.selectedDate}</FieldError>
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
                    <p className="text-label text-text-3">Horarios</p>
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
                            "relative flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0",
                            disabled && "cursor-not-allowed opacity-40",
                            sel ? "border-fire-500 bg-fire-500/[0.08]" : "border-line-1 bg-ink-2 hover:border-fire-500/50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                              sel ? "border-fire-500 bg-fire-500 text-fire-on" : "border-line-2 bg-ink-3 text-fire-400",
                            )}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-body font-semibold text-text-1">{label}</span>
                            <span className="mt-0.5 block font-mono text-label text-text-3">{sub}</span>
                          </span>
                          {disabled ? (
                            <Badge size="md">No disponible</Badge>
                          ) : sel ? (
                            <Check className="h-5 w-5 shrink-0 text-fire-400" strokeWidth={2.5} aria-hidden />
                          ) : null}
                        </button>
                      );
                    })}
                    <FieldError id="selectedSlot-error">{errors.selectedSlot}</FieldError>
                  </div>
                ) : (
                  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-line-2 px-6 text-center">
                    <CalendarDays className="h-7 w-7 text-fire-400" strokeWidth={1.5} aria-hidden />
                    <Text as="p" size="body-sm" tone="2" className="mt-3">
                      Elige un día para ver los horarios disponibles.
                    </Text>
                  </div>
                )}
              </div>
            )}

            {s.step === 4 && (
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField id="fullName" label="Nombre completo" error={errors.fullName} className="sm:col-span-2">
                  <Input autoComplete="name" value={s.fullName} onChange={(e) => setAndClear("fullName", e.target.value)} />
                </FormField>
                <FormField id="phone" label="WhatsApp" error={errors.phone}>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+57 300 000 0000"
                    value={s.phone}
                    onChange={(e) => setAndClear("phone", e.target.value)}
                  />
                </FormField>
                <FormField id="email" label="Email" error={errors.email}>
                  <Input type="email" inputMode="email" autoComplete="email" value={s.email} onChange={(e) => setAndClear("email", e.target.value)} />
                </FormField>
                <FormField id="instagram" label="Instagram (opcional, sin @)" error={errors.instagram} className="sm:col-span-2">
                  <Input placeholder="tunombre" value={s.instagram} onChange={(e) => setAndClear("instagram", e.target.value)} />
                </FormField>
              </div>
            )}

            {s.step === 5 && s.serviceTypes.length > 0 && s.selectedDate && s.selectedSlot && (
              <div className="space-y-6">
                <section className="rounded-lg border border-line-1 bg-ink-2 p-5 sm:p-6" aria-labelledby="summary-title">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading as="h3" size="display-sm" id="summary-title">
                      Resumen de tu sesión
                    </Heading>
                    <Button type="button" variant="link" size="sm" onClick={() => goTo(1)}>
                      Editar datos
                    </Button>
                  </div>
                  <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-label text-text-3">Servicios</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {selectedServices.map((svc) => {
                          const price = servicePriceLine(svc);
                          return (
                            <Badge key={svc.type} tone="fire" size="md">
                              {svc.title}
                              {price ? <span className="text-fire-300/70">· {price}</span> : null}
                            </Badge>
                          );
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-label text-text-3">Fecha y horario</dt>
                      <dd className="mt-1 text-body-sm text-text-1">
                        <span className="block capitalize">{format(s.selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
                        <span className="block font-mono text-label text-text-2">{TIME_SLOT_LABELS[s.selectedSlot]}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-label text-text-3">Artista</dt>
                      <dd className="mt-1 text-body-sm text-text-1">
                        <strong className="font-semibold">{s.artisticName}</strong>
                        <span className="block text-text-2">{s.genres.join(", ")}</span>
                        <a
                          href={s.musicReference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-sweep mt-1 inline-flex min-h-11 items-center text-fire-400 hover:text-fire-300"
                        >
                          Ver referencia musical
                        </a>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-label text-text-3">Contacto</dt>
                      <dd className="mt-1 break-words text-body-sm text-text-1">
                        {s.fullName} · {s.email} · {s.phone}
                        {s.instagram ? ` · @${s.instagram.replace(/^@/, "")}` : ""}
                      </dd>
                    </div>
                    {s.vision ? (
                      <div className="sm:col-span-2">
                        <dt className="text-label text-text-3">Tu visión</dt>
                        <dd className="mt-1 whitespace-pre-line text-body-sm text-text-2">{s.vision}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                <section className="rounded-lg border border-gold-500/30 bg-gold-500/[0.06] p-5 sm:p-6" aria-labelledby="terms-title">
                  <div className="flex flex-wrap items-center gap-3">
                    <Heading as="h3" size="display-sm" id="terms-title">
                      Anticipo y cancelación
                    </Heading>
                    {depositPercent > 0 ? (
                      <Badge tone="gold" variant="solid" size="md">
                        {depositPercent}% anticipo
                      </Badge>
                    ) : null}
                  </div>
                  <ul className="mt-4 space-y-2 text-body-sm text-text-2">
                    {depositPercent > 0 ? (
                      <li>
                        Para reservar la fecha se solicita un anticipo del <strong className="font-semibold text-text-1">{depositPercent}%</strong> del
                        valor de la sesión; el saldo se paga el día de la sesión.
                      </li>
                    ) : (
                      <li>No se requiere anticipo para reservar; el pago se realiza el día de la sesión.</li>
                    )}
                    <li>
                      Puedes cancelar o reprogramar sin costo con al menos{" "}
                      <strong className="font-semibold text-text-1">{cancellationHours} h</strong> de anticipación. Después de ese plazo el anticipo no
                      se reembolsa.
                    </li>
                    <li>
                      Condiciones completas en los{" "}
                      <Link href="/legal/terminos-estudio" target="_blank" className="link-sweep text-fire-400 hover:text-fire-300">
                        Términos del estudio
                      </Link>
                      .
                    </li>
                  </ul>
                  <div className="mt-4">
                    <label htmlFor="cancellationAccepted" className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-body-sm text-text-2">
                      <Checkbox
                        id="cancellationAccepted"
                        checked={s.cancellationAccepted}
                        onCheckedChange={(v) => setAndClear("cancellationAccepted", v === true)}
                        aria-required
                        aria-invalid={errors.cancellationAccepted ? true : undefined}
                        aria-describedby={errors.cancellationAccepted ? "cancellationAccepted-error" : undefined}
                        className="mt-0.5"
                      />
                      <span>
                        Entiendo la política de anticipo y que puedo cancelar o reprogramar con al menos {cancellationHours} h de anticipación.{" "}
                        <span className="text-text-3">(obligatorio)</span>
                      </span>
                    </label>
                    <FieldError id="cancellationAccepted-error" className="pl-8">
                      {errors.cancellationAccepted}
                    </FieldError>
                  </div>
                </section>

                <fieldset
                  className="rounded-lg border border-line-1 bg-ink-2 p-5 focus-visible:outline-none sm:p-6"
                  data-field="isAdult"
                  tabIndex={-1}
                  aria-invalid={errors.isAdult ? true : undefined}
                  aria-describedby={errors.isAdult ? "isAdult-error" : "isAdult-hint"}
                >
                  <legend className="sr-only">¿Eres mayor de 18 años?</legend>
                  <Heading as="p" size="display-sm" aria-hidden>
                    ¿Eres mayor de 18 años?
                  </Heading>
                  <Text as="p" size="body-sm" tone="3" id="isAdult-hint" className="mt-2">
                    Lo necesitamos para saber si la sesión requiere autorización de un acudiente.
                  </Text>
                  <RadioGroup
                    className="mt-4 gap-3 sm:grid-cols-2"
                    aria-label="¿Eres mayor de 18 años?"
                    value={s.isAdult === null ? "" : String(s.isAdult)}
                    onValueChange={(v) => setAndClear("isAdult", v === "true")}
                  >
                    {[
                      { value: "true", label: "Sí, soy mayor de edad" },
                      { value: "false", label: "No, soy menor de edad" },
                    ].map((opt) => {
                      const on = String(s.isAdult) === opt.value;
                      return (
                        <Label
                          key={opt.value}
                          htmlFor={`isAdult-${opt.value}`}
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded border px-4 py-2 text-body transition-colors duration-150",
                            on ? "border-fire-500 bg-fire-500/[0.08] text-text-1" : "border-line-2 text-text-2 hover:border-fire-500/50",
                          )}
                        >
                          <RadioGroupItem id={`isAdult-${opt.value}`} value={opt.value} />
                          {opt.label}
                        </Label>
                      );
                    })}
                  </RadioGroup>
                  <FieldError id="isAdult-error">{errors.isAdult}</FieldError>
                  {s.isAdult === false ? (
                    <p role="status" className="mt-4 flex items-start gap-2 rounded border border-warning/40 bg-warning/10 px-3 py-2 text-body-sm text-warning">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      <span>
                        Si eres menor de edad, la sesión requiere autorización escrita y acompañamiento de tu padre, madre o acudiente. Te
                        contactaremos para coordinarlo; puedes continuar con la reserva.
                      </span>
                    </p>
                  ) : null}
                </fieldset>

                <section className="space-y-2 rounded-lg border border-line-1 bg-ink-2 p-5 sm:p-6" aria-label="Datos personales">
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
                  <p role="alert" className="rounded border border-danger/40 bg-danger/10 px-3 py-2 text-body-sm text-danger">
                    {errors.form}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className={cn("mt-10 flex flex-col-reverse gap-3 border-t border-line-1 pt-6 sm:flex-row", s.step === 1 ? "sm:justify-end" : "sm:justify-between")}>
            {s.step > 1 ? (
              <Button type="button" variant="outline" size="lg" onClick={() => goTo(Math.max(1, s.step - 1))}>
                Anterior
              </Button>
            ) : null}
            {s.step < TOTAL_STEPS ? (
              <Button type="button" size="lg" withArrow onClick={goNext}>
                Siguiente
              </Button>
            ) : (
              <Button type="button" size="lg" loading={loading} onClick={() => void onConfirm()}>
                {loading ? "Enviando…" : "Confirmar sesión"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
