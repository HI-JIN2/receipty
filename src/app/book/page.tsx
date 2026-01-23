import SiteChrome from "@/components/SiteChrome";
import BookReceiptClient from "@/features/receipts/book/BookReceiptClient";

export default function BookReceiptPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Receipt Marker",
            description:
              "도서/영화 등 기록을 작은 영수증으로 만들어 저장하고 출력할 수 있어요.",
            url: process.env.NEXT_PUBLIC_SITE_URL || "",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "KRW",
            },
            creator: {
              "@type": "Organization",
              name: "HI-JIN2",
            },
          }),
        }}
      />

      <SiteChrome activeHref="/book">
        <BookReceiptClient />
      </SiteChrome>
    </>
  );
}
