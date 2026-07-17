"use client";

import Link from "next/link";
import { useTurboStore } from "@/lib/store";
import CarIllustration from "../CarIllustration";
import StatusBadge from "../StatusBadge";
import PriceTag from "../PriceTag";
import CountdownTimer from "../CountdownTimer";
import LiveBidFeed from "../LiveBidFeed";
import { formatNumber } from "@/lib/format";

export default function LiveShowcase() {
  const auctions = useTurboStore((s) => s.auctions);
  const live = auctions.filter((a) => a.status === "live");

  if (live.length === 0) return null;

  const featured = live.reduce((max, a) => (a.currentPrice > max.currentPrice ? a : max), live[0]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
            Asosiy jonli savdo
          </p>
          <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
            Hozir eng qizg&apos;in bahs
          </h2>
        </div>
        <Link
          href="/auksionlar"
          className="hidden font-condensed text-sm font-bold uppercase tracking-wide text-turbo-muted hover:text-turbo-red sm:block"
        >
          Barchasi →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-turbo-border bg-turbo-surface lg:grid-cols-2">
        <div className="relative min-h-[280px]">
          <CarIllustration accent={featured.accent} label={featured.title} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <StatusBadge status={featured.status} />
          </div>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <h3 className="font-condensed text-2xl font-bold text-white">{featured.title}</h3>
          <p className="mt-1 text-sm text-turbo-muted">
            {featured.year} · {featured.city} · {formatNumber(featured.mileageKm)} km ·{" "}
            {featured.transmission}
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-turbo-border bg-turbo-black/50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-turbo-muted">Joriy narx</p>
              <PriceTag amount={featured.currentPrice} size="xl" />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-turbo-muted">Tugashiga</p>
              <CountdownTimer targetMs={featured.endAt} size="lg" />
            </div>
          </div>

          <div className="mt-6 flex-1">
            <p className="mb-3 font-condensed text-xs font-bold uppercase tracking-wider text-turbo-muted">
              So&apos;nggi takliflar
            </p>
            <LiveBidFeed bids={featured.bids} maxItems={4} />
          </div>

          <Link
            href={`/auksionlar/${featured.slug}`}
            className="mt-6 rounded-full bg-turbo-red px-6 py-3.5 text-center font-condensed text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
          >
            Savdoga qatnashish
          </Link>
        </div>
      </div>
    </section>
  );
}
