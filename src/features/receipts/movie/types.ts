export type MovieMedium = "theater" | "ott" | "other";

export type MovieMode = "receipt" | "photo";

export type MovieReceipt = {
  mode: MovieMode;
  title: string;
  viewer: string;
  watchedAt: string;
  place: string;
  medium: MovieMedium;
  note: string;
  format: string;
  backgroundColor: string;
};
