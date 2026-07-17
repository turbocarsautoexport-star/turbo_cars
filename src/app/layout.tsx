import type { Metadata } from "next";
import { Racing_Sans_One, Rajdhani, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RealtimeEngine from "@/components/RealtimeEngine";

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
  title: "TURBO | Mashinalar bo'yicha kim oshdi savdosi",
  description:
    "TURBO — real vaqtda o'tkaziladigan mashinalar auksioni. Jonli narx oshishi, taймер bilan boshqariladigan savdolar va ishonchli g'oliblar.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
