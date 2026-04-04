import { create } from "zustand";
import type { ServiceType } from "@/types/enums";

export interface BookingStore {
  step: number;
  serviceTypes: ServiceType[];
  artisticName: string;
  genres: string[];
  musicReference: string;
  vision: string;
  isFirstTime: boolean;
  selectedDate: Date | null;
  selectedSlot: "morning" | "afternoon" | "night" | null;
  fullName: string;
  phone: string;
  email: string;
  instagram: string;
  setStep: (step: number) => void;
  setField: <K extends keyof BookingStore>(key: K, value: BookingStore[K]) => void;
  reset: () => void;
}

const initial: Omit<BookingStore, "setStep" | "setField" | "reset"> = {
  step: 1,
  serviceTypes: [],
  artisticName: "",
  genres: [],
  musicReference: "",
  vision: "",
  isFirstTime: true,
  selectedDate: null,
  selectedSlot: null,
  fullName: "",
  phone: "",
  email: "",
  instagram: "",
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setField: (key, value) => set({ [key]: value } as Partial<BookingStore>),
  reset: () => set({ ...initial }),
}));
