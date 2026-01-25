import type { Metadata } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const uiFont = IBM_Plex_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const ticketFont = localFont({
  src: [
    {
      path: "./fonts/PFStardust-S-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PFStardust-S-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/PFStardust-S-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-ticket",
  display: "swap",
});

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
  : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL("http://localhost:3000");

const ogImageUrl = new URL("/og-image-v3.png", metadataBase);

export const metadata: Metadata = {
  metadataBase,
  alternates: {
    canonical: "/",
  },
  title: "receipty - 기록을 영수증처럼",
  description:
    "도서/영화 같은 취향 기록을 작은 영수증으로 만들고 JPEG로 저장해요. 로그인 없이 바로 만들 수 있어요.",
  keywords: ["책 영수증", "도서 대출 영수증", "전자책", "도서관", "독서", "도서 대여", "북카페", "독립서점", "책 기록", "독서", "책 목록", "영수증 프린트",
    "책 영수증", "도서 영수증 만들기", "도서 대출 영수증",
    "책 대여증", "도서 대여", "대출 기록표",
    "독서 기록", "독서 로그", "독서 트래커", "책 기록",
    "전자책", "전자책 기록", "e북 대여 기록",
    "영수증 프린트", "라벨 프린트", "감성 영수증",
    "영화 영수증", "영화 티켓", "영화 입장권", "입장권", "관람 기록", "포토티켓", "티켓북",
    "북카페", "독립서점", "책 목록", "책 관리",
    "Book Receipt", "북 레시트",
    "Movie Receipt", "Movie Ticket", "Photo Ticket",
    "receipty", "receipty studio"
  ],
  authors: [{ name: "HI-JIN2" }],
  creator: "HI-JIN2",
  openGraph: {
    title: "receipty",
    description: "기록을 영수증처럼",
    type: "website",
    locale: "ko_KR",
    siteName: "receipty",
    url: metadataBase,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "receipty",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "receipty - 기록을 영수증처럼",
    description:
      "도서/영화 같은 취향 기록을 작은 영수증으로 만들고 JPEG로 저장해요. 로그인 없이 바로 시작.",
    images: [ogImageUrl.toString()],
  },
  manifest: "/favicon/manifest.json",
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
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon/favicon.ico"],
  },
  other: {
    "msapplication-TileColor": "#f7f7f6",
    "msapplication-TileImage": "/favicon/ms-icon-144x144.png",
    "msapplication-config": "/favicon/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${uiFont.variable} ${ticketFont.variable} ${bookCafe.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
