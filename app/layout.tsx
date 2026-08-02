import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

function getSafeSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return "https://aicococolor.com";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "https://aicococolor.com";
    }
    return raw;
  } catch {
    return "https://aicococolor.com";
  }
}

const siteUrl = getSafeSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Coco Color · 色彩诊断 · 整体形象设计",
  description:
    "Coco Color 色彩诊断·整体形象设计 —— 主理人 COCO，资深形象顾问，提供专业色彩诊断与整体形象设计服务。",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
