export type MovieMedium = "theater" | "ott" | "other";

export type MovieMode = "receipt" | "photo" | "mini";

export type MovieReceipt = {
  mode: MovieMode;

  // If selected from TMDB search
  tmdbId: number | null;
  posterUrl: string | null;
  releaseDate: string | null;
  title: string;
  watchedAt: string;
  watchedTime: string;
  issuedAt: string;
  theater: string;
  medium: MovieMedium;
  note: string;

  // Photo ticket fields (55 x 85mm)
  photoFormat: string;
  ageRating: string;
  subtitle: string;
  showtime: string;
  session: string;
  hall: string;
  seat: string;
  ticketType: string;

  format: string;
  backgroundColor: string;
};
