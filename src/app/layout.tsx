import type { Metadata } from "next";
import localFont from "next/font/local";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const bookCafe = localFont({
  src: [
    {
      path: "./fonts/PFStardust-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PFStardust-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/PFStardust-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-book-cafe",
  display: "swap",
});


const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Book Receipt - 나만의 도서 영수증 만들기",
  description: "도서 영수증이 필요할때 자유롭게 만들고 프린트해보세요. 로그인은 필요하지 않아요.",
  keywords: ["책 영수증", "도서 대출 영수증", "전자책", "도서관", "독서", "도서 대여", "북카페", "독립서점", "책 기록", "독서", "책 목록", "영수증 프린트",
    "책 영수증", "도서 영수증 만들기", "도서 대출 영수증",
    "책 대여증", "도서 대여", "대출 기록표",
    "독서 기록", "독서 로그", "독서 트래커", "책 기록",
    "전자책", "전자책 기록", "e북 대여 기록",
    "영수증 프린트", "라벨 프린트", "감성 영수증",
    "북카페", "독립서점", "책 목록", "책 관리",
    "Book Receipt", "북 레시트"
  ],
  authors: [{ name: "HI-JIN2" }],
  creator: "HI-JIN2",
  openGraph: {
    title: "Book Receipt",
    description: "나만의 도서 영수증 만들기",
    type: "website",
    locale: "ko_KR",
    siteName: "Book Receipt",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    images: [
      {
        url: new URL("/og-image.png", metadataBase).toString(),
        width: 1200,
        height: 630,
        alt: "Book Receipt",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Receipt - 나만의 도서 영수증 만들기",
    description: "도서 영수증이 필요할때 자유롭게 만들고 프린트해보세요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${bookCafe.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
