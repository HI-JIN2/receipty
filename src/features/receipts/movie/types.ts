export type MovieMedium = "theater" | "ott" | "other";

export type MovieReceipt = {
  title: string;
  viewer: string;
  watchedAt: string;
  place: string;
  medium: MovieMedium;
  note: string;
  format: string;
  backgroundColor: string;
};
