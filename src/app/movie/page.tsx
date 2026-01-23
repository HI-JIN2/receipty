import SiteChrome from "@/components/SiteChrome";
import MovieReceiptClient from "@/features/receipts/movie/MovieReceiptClient";

export default function MovieReceiptPage() {
  return (
    <SiteChrome activeHref="/movie">
      <MovieReceiptClient />
    </SiteChrome>
  );
}
