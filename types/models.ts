export interface Production {
  id: string;
  title: string;
  artistName: string;
  artistCity: string;
  artistCountry: string;
  year: number;
  genre: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number | null;
  mood: string | null;
  priceCOP: number;
  status: string;
  audioUrl: string | null;
  coverUrl: string | null;
  exclusive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Release {
  id: string;
  title: string;
  slug: string;
  artistName: string;
  genre: string;
  releaseYear: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  description: string | null;
  featured: boolean;
  /** true = aparece en /releases (próximos y adelantos). false = solo catálogo interno / producciones pasadas. */
  upcoming?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSessionRow {
  id: string;
  serviceType: string;
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  artistInstagram: string | null;
  musicReference: string;
  vision: string | null;
  genres: string;
  isFirstTime: boolean;
  scheduledDate: string;
  timeSlot: string;
  status: string;
  internalNotes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
