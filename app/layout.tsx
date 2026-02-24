import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"] });
const myFont = localFont({
  src: [
    {
      path: "../public/fonts/NotoSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NotoSansArabic-Medium.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-primary",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json",

  title: "Dormitory",
  description: "Dormitory Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
      </head>
      <body className={myFont.className}>{children}</body>
    </html>
  );
}
