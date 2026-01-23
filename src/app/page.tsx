import SiteChrome from "@/components/SiteChrome";
import HomeClient from "./HomeClient";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Book Receipt Maker",
            description:
              "전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로 붙여두세요.",
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

      <SiteChrome activeHref="/">
        <HomeClient />
      </SiteChrome>
    </>
  );
}
