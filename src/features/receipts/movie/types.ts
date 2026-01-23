export type MovieMedium = "theater" | "ott" | "other";

export type MovieMode = "receipt" | "photo";

export type MovieReceipt = {
  mode: MovieMode;
  title: string;
  watchedAt: string;
  watchedTime: string;
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
  brand: string;

  format: string;
  backgroundColor: string;
};
