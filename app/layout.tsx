import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aicococolor.com";

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
