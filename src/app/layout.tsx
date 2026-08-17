import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

// ========================================
// Fonts
// ========================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ========================================
// Metadata
// ========================================

export const metadata: Metadata = {
  title: "SCI Red Zone",

  description:
    "SCI Red Zone เกมเอาชีวิตรอดแนว 2.5D Survival Horror ที่ผู้เล่นต้องสำรวจอาคารวิทยาศาสตร์ ไขปริศนา ค้นหาทางรอด และเอาชีวิตรอดจากสิ่งมีชีวิตกลายพันธุ์ภายในพื้นที่วิกฤต",

  applicationName: "SCI Red Zone",

  keywords: [
    "SCI Red Zone",
    "2.5D Game",
    "Survival Horror",
    "Puzzle Game",
    "Science Game",
    "Web Game",
  ],

  authors: [
    {
      name: "SCI Red Zone Team",
    },
  ],

  creator: "SCI Red Zone Team",

  category: "game",
};

// ========================================
// Root Layout
// ========================================

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >
      <body
        className="
          flex
          min-h-full
          flex-col
        "
      >
        {children}
      </body>
    </html>
  );
}
