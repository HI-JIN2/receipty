export type ReceiptKind = "book" | "movie";

export type BaseReceipt = {
  title: string;
  renter: string;
  rentalDate: string;
  returnDate: string;
  note: string;
  format: string;
  backgroundColor: string;
};
