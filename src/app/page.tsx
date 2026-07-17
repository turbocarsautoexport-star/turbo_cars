import Hero from "@/components/home/Hero";
import LiveShowcase from "@/components/home/LiveShowcase";
import AuctionsPreviewGrid from "@/components/home/AuctionsPreviewGrid";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <LiveShowcase />
      <AuctionsPreviewGrid />
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-turbo-red/30 bg-gradient-to-br from-turbo-surface via-turbo-surface to-turbo-red/10 p-10 text-center sm:p-16">
          <h2 className="font-display text-2xl text-white sm:text-4xl">
            Keyingi g&apos;olib siz bo&apos;lasizmi?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-turbo-muted sm:text-base">
            Hozir jonli savdolarga qo&apos;shiling va o&apos;zingiz yoqtirgan
            mashina uchun kurashda ishtirok eting.
          </p>
          <Link
            href="/auksionlar"
            className="mt-7 inline-block rounded-full bg-turbo-red px-8 py-3.5 font-condensed text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
          >
            Auksionlarga o&apos;tish
          </Link>
        </div>
      </section>
    </>
  );
}
