import type { Metadata } from "next";
import { Racing_Sans_One, Rajdhani, Manrope } from "next/font/google";
import "./globals.css";
import RealtimeEngine from "@/components/RealtimeEngine";
import SupportWidget from "@/components/chat/SupportWidget";

const racing = Racing_Sans_One({
  variable: "--font-racing",
  weight: "400",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TURBO | Avtomobil eksporti va kim oshdi savdosi",
  description:
    "TURBO — avtomobil eksporti va real vaqtda o'tkaziladigan mashinalar auksioni. Jonli narx oshishi, taймер bilan boshqariladigan savdolar va ishonchli g'oliblar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${racing.variable} ${rajdhani.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-turbo-black text-foreground">
        <RealtimeEngine />
        <main className="flex flex-1 flex-col">{children}</main>
        <SupportWidget />
      </body>
    </html>
  );
}
