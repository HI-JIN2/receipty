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
            name: "receipty studio",
            description:
              "기록을 영수증처럼. 도서/영화 같은 취향 기록을 작은 영수증으로 만들고 저장해요.",
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
