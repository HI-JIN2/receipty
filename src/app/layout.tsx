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


export const metadata: Metadata = {
  title: "Book Receipt - 나만의 도서 영수증 만들기",
  description: "전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로 붙여두세요. 로그인 없이 가볍게 쓰고, 네이버 도서 검색으로 쉽게 책을 찾아보세요.",
  keywords: ["책 영수증","도서 대출 영수증", "전자책","도서관", "독서","도서 대여", "북카페", "책 기록", "독서", "책 목록", "영수증 프린트"],
  authors: [{ name: "HI-JIN2" }],
  creator: "HI-JIN2",
  openGraph: {
    title: "Book Receipt - 나만의 도서 영수증 만들기",
    description: "전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로 붙여두세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "Book Receipt",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Book Receipt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Receipt - 북카페처럼, 조용히 책 영수증을 남기는 공간",
    description: "전자책 대여 내역을 작은 영수증으로 기록해서 프린트하거나 라벨로 붙여두세요.",
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
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
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
