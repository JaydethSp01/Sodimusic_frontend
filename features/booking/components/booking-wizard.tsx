"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { format, startOfTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useBookingStore } from "@/features/booking/stores/booking-store";
import { bookingStep2Schema } from "@/features/booking/schemas/booking-schema";
import { createBookingSession } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { pageTransition } from "@/lib/animations";
import { getPublicApiUrl } from "@/lib/api";
import { TIME_SLOT_LABELS } from "@/lib/constants";
import type { ServiceType } from "@/types/enums";
import { Check, Moon, Sun, Sunrise } from "lucide-react";
import "react-day-picker/style.css";
import type { DayPickerProps } from "react-day-picker";

export type BookingConfig = {
  stepLabels: string[];
  services: { type: string; icon: string; title: string; desc: string }[];
  genreChips: string[];
};

const bookingFieldClass =
  "mt-1 border border-white/10 bg-white/5 transition-colors duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-0";

function genreChipClass(genre: string, on: boolean) {
  const base = "rounded-full border px-3 py-1 font-mono text-xs transition-colors duration-200";
  const styles: Record<string, { on: string; off: string }> = {
    Trap: {
      on: "border-[#FF6B00] bg-[rgba(255,107,0,0.12)] text-[#FF6B00]",
      off: "border-white/10 text-[var(--text-secondary)] hover:border-[#FF6B00]/40",
    },
    Reggaeton: {
      on: "border-[#9B59B6] bg-[rgba(155,89,182,0.12)] text-[#9B59B6]",
      off: "border-white/10 text-[var(--text-secondary)] hover:border-[#9B59B6]/40",
    },
    Afrobeat: {
      on: "border-[#D4A017] bg-[rgba(212,160,23,0.12)] text-[#D4A017]",
      off: "border-white/10 text-[var(--text-secondary)] hover:border-[#D4A017]/40",
    },
    Dancehall: {
      on: "border-[#27AE60] bg-[rgba(39,174,96,0.12)] text-[#27AE60]",
      off: "border-white/10 text-[var(--text-secondary)] hover:border-[#27AE60]/40",
    },
    Otro: {
      on: "border-primary bg-primary-muted text-primary",
      off: "border-white/10 text-[var(--text-secondary)] hover:border-primary/30",
    },
  };
  const s = styles[genre] ?? styles.Otro;
  return cn(base, on ? s.on : s.off);
}

const DayPicker = dynamic<DayPickerProps>(
  () => import("react-day-picker").then((mod) => mod.DayPicker),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto h-[320px] w-full max-w-md animate-pulse rounded-lg border border-border bg-background-card" />
    ),
  },
);

function StepIndicator({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="mb-8">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 md:justify-between md:gap-4">
        {labels.map((l, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={l} className="flex min-w-[72px] flex-col items-center gap-2 md:min-w-0 md:flex-1">
              <motion.div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-mono",
                  done && "border-primary bg-primary text-white",
                  active && "border-primary bg-primary/15 text-primary",
                  !done && !active && "border-white/10 text-[var(--text-muted)]",
                )}
                animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={active ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : undefined}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : n}
              </motion.div>
              <span
                className={cn(
                  "text-center text-[10px] font-mono uppercase tracking-wider md:text-xs",
                  (done || active) && "text-primary",
                  !done && !active && "text-[var(--text-muted)]",
                )}
              >
                {l}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1 w-full overflow-hidden rounded bg-background-elevated">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${((step - 1) / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function BookingWizard({ booking }: { booking: BookingConfig }) {
  const s = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [occupied, setOccupied] = useState<string[]>([]);
  const [dayBlocked, setDayBlocked] = useState(false);

  const api = getPublicApiUrl();

  useEffect(() => {
    if (!s.selectedDate) {
      return;
    }
    const key = format(s.selectedDate, "yyyy-MM-dd");
    let cancelled = false;
    (async () => {
      const r = await fetch(`${api}/api/booking/availability?date=${key}`);
      const data = (await r.json()) as { occupied: string[]; blocked: boolean };
      if (!cancelled) {
        setOccupied(data.occupied ?? []);
        setDayBlocked(!!data.blocked);
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

  async function goNext() {
    if (s.step === 1 && s.serviceTypes.length === 0) {
      toast.error("Elige al menos un servicio");
      return;
    }
    if (s.step === 2) {
      const r = bookingStep2Schema.safeParse({
        artisticName: s.artisticName,
        genres: s.genres,
        musicReference: s.musicReference,
        vision: s.vision || undefined,
        isFirstTime: s.isFirstTime,
      });
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Revisa el paso 2");
        return;
      }
    }
    if (s.step === 3) {
      if (!s.selectedDate || !s.selectedSlot) {
        toast.error("Elige fecha y horario");
        return;
      }
      if (dayBlocked) {
        toast.error("Este día no está disponible");
        return;
      }
      if (s.selectedSlot && occupied.includes(s.selectedSlot)) {
        toast.error("Ese horario ya está ocupado");
        return;
      }
    }
    if (s.step === 4) {
      if (!s.fullName.trim() || !s.phone.trim() || !s.email.trim()) {
        toast.error("Completa tus datos de contacto");
        return;
      }
    }
    s.setStep(Math.min(5, s.step + 1));
  }

  async function onConfirm() {
    if (s.serviceTypes.length === 0 || !s.selectedDate || !s.selectedSlot) {
      return;
    }
    if (!acceptPolicy) {
      toast.error("Debes aceptar la política de cancelación");
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
      acceptPolicy,
    };
    const result = await createBookingSession(payload);
    setLoading(false);
    if (result && "ok" in result && result.ok === false) {
      toast.error(result.error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <StepIndicator step={s.step} labels={booking.stepLabels} />
      <AnimatePresence mode="wait">
        <motion.div key={s.step} initial="initial" animate="animate" exit="exit" variants={pageTransition}>
          {s.step === 1 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-[var(--text-muted)]">Puedes seleccionar uno o varios servicios para la misma sesión.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {booking.services.map((svc, idx) => {
                  const type = svc.type as ServiceType;
                  const selected = s.serviceTypes.includes(type);
                  const n = String(idx + 1).padStart(2, "0");
                  return (
                    <button
                      key={svc.type}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${svc.title}: ${svc.desc}`}
                      onClick={() =>
                        s.setField(
                          "serviceTypes",
                          selected
                            ? s.serviceTypes.filter((current) => current !== type)
                            : [...s.serviceTypes, type],
                        )
                      }
                      className={cn(
                        "relative overflow-hidden rounded-lg border p-4 text-left transition-all duration-200",
                        selected
                          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,107,0,0.2)]"
                          : "border-border bg-background-card hover:border-primary/35",
                      )}
                    >
                      <span
                        className="pointer-events-none absolute -right-1 -top-3 font-display text-[72px] leading-none text-white/[0.04]"
                        aria-hidden
                      >
                        {n}
                      </span>
                      <div className="relative flex items-start justify-between gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-2xl">
                          {svc.icon}
                        </span>
                        <AnimatePresence>
                          {selected ? (
                            <motion.span
                              key="chk"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="rounded-full bg-primary/20 p-1"
                            >
                              <Check className="h-5 w-5 text-primary" aria-hidden />
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <p className="relative mt-3 font-display text-lg">{svc.title}</p>
                      <p className="relative text-sm text-[var(--text-secondary)]">{svc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {s.step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="artisticName">¿Cómo te llaman?</Label>
                <Input
                  id="artisticName"
                  value={s.artisticName}
                  onChange={(e) => s.setField("artisticName", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
              <fieldset>
                <legend className="text-sm font-medium">Géneros</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.genreChips.map((g) => {
                    const on = s.genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          s.setField(
                            "genres",
                            on ? s.genres.filter((x) => x !== g) : [...s.genres, g],
                          )
                        }
                        className={genreChipClass(g, on)}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div>
                <Label htmlFor="musicReference">¿A qué artista o canción te pareces o quieres sonar?</Label>
                <Input
                  id="musicReference"
                  placeholder="https://open.spotify.com/track/... o https://youtu.be/..."
                  value={s.musicReference}
                  onChange={(e) => s.setField("musicReference", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="vision">Cuéntanos tu visión para esta sesión (opcional)</Label>
                <Textarea
                  id="vision"
                  maxLength={500}
                  value={s.vision}
                  onChange={(e) => s.setField("vision", e.target.value)}
                  className={cn(bookingFieldClass, "min-h-[100px] resize-y")}
                />
                <p className="mt-1 text-right font-mono text-xs text-[var(--text-muted)]">{s.vision.length}/500</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={s.isFirstTime ? "default" : "outline"}
                  onClick={() => s.setField("isFirstTime", true)}
                  aria-pressed={s.isFirstTime}
                >
                  Primera vez ✓
                </Button>
                <Button
                  type="button"
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
              <DayPicker
                mode="single"
                selected={s.selectedDate ?? undefined}
                onSelect={(d) => {
                  s.setField("selectedDate", d ?? null);
                  s.setField("selectedSlot", null);
                }}
                locale={es}
                disabled={isDayDisabled}
                className="booking-calendar mx-auto rounded-lg border border-border bg-background-card p-4"
                style={
                  {
                    "--rdp-accent-color": "var(--primary)",
                    "--rdp-accent-background-color": "rgba(255, 107, 0, 0.18)",
                    "--rdp-disabled-opacity": "0.3",
                  } as CSSProperties
                }
              />
              {s.selectedDate ? (
                <div className="space-y-2">
                  <p className="font-mono text-xs text-[var(--text-muted)]">Horarios</p>
                  {(
                    [
                      { slot: "morning" as const, icon: Sunrise, label: "Mañana", sub: "9am – 12pm" },
                      { slot: "afternoon" as const, icon: Sun, label: "Tarde", sub: "2pm – 6pm" },
                      { slot: "night" as const, icon: Moon, label: "Noche", sub: "7pm – 10pm" },
                    ] as const
                  ).map(({ slot, icon: Icon, label, sub }) => {
                    const disabled = dayBlocked || occupied.includes(slot);
                    const sel = s.selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        aria-disabled={disabled}
                        onClick={() => s.setField("selectedSlot", slot)}
                        className={cn(
                          "relative flex w-full items-center gap-4 overflow-hidden rounded-lg border px-4 py-4 text-left transition-all duration-200",
                          disabled && "cursor-not-allowed opacity-30",
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
                </div>
              ) : null}
            </div>
          )}

          {s.step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={s.fullName}
                  onChange={(e) => s.setField("fullName", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={s.phone}
                  onChange={(e) => s.setField("phone", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={s.email}
                  onChange={(e) => s.setField("email", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram (opcional, sin @)</Label>
                <Input
                  id="instagram"
                  placeholder="tunombre"
                  value={s.instagram}
                  onChange={(e) => s.setField("instagram", e.target.value)}
                  className={bookingFieldClass}
                />
              </div>
            </div>
          )}

          {s.step === 5 && s.serviceTypes.length > 0 && s.selectedDate && s.selectedSlot && (
            <div className="space-y-4 rounded-lg border border-border bg-background-card p-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Servicios seleccionados</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.serviceTypes.map((serviceType) => (
                    <span key={serviceType} className="rounded-full border border-primary/40 bg-primary-muted px-3 py-1 font-mono text-xs text-primary">
                      {booking.services.find((x) => x.type === serviceType)?.title ?? serviceType}
                    </span>
                  ))}
                </div>
              </div>
              <p>
                <strong>{s.artisticName}</strong> · {s.genres.join(", ")}
              </p>
              <p>
                <a href={s.musicReference} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Referencia musical
                </a>
              </p>
              {s.vision ? <p className="text-sm text-[var(--text-secondary)]">{s.vision}</p> : null}
              <p className="font-mono text-sm">
                {format(s.selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
              </p>
              <p className="font-mono text-sm">{TIME_SLOT_LABELS[s.selectedSlot]}</p>
              <p className="text-sm">
                {s.fullName} · {s.email} · {s.phone}
              </p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="policy"
                  checked={acceptPolicy}
                  onCheckedChange={(v) => setAcceptPolicy(v === true)}
                  aria-describedby="policy-desc"
                />
                <Label id="policy-desc" htmlFor="policy" className="text-sm leading-snug">
                  Entiendo que puedo cancelar o reprogramar con al menos 24 horas de anticipación
                </Label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={s.step === 1}
          onClick={() => s.setStep(Math.max(1, s.step - 1))}
        >
          Anterior
        </Button>
        {s.step < 5 ? (
          <Button type="button" onClick={() => void goNext()}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" disabled={loading} onClick={() => void onConfirm()}>
            {loading ? "Enviando…" : "Confirmar sesión"}
          </Button>
        )}
      </div>
    </div>
  );
}
