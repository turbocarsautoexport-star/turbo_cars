"use client";

import Link from "next/link";
import { useTurboStore } from "@/lib/store";
import AuctionCard from "../AuctionCard";

export default function AuctionsPreviewGrid() {
  const auctions = useTurboStore((s) => s.auctions);
  const preview = [...auctions]
    .sort((a, b) => {
      const order = { live: 0, upcoming: 1, ended: 2 };
      return order[a.status] - order[b.status];
    })
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
            Auksionlar
          </p>
          <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
            Jonli va tez orada boshlanadigan savdolar
          </h2>
        </div>
        <Link
          href="/auksionlar"
          className="hidden font-condensed text-sm font-bold uppercase tracking-wide text-turbo-muted hover:text-turbo-red sm:block"
        >
          Barchasi →
        </Link>
      </div>

      {preview.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-turbo-border bg-turbo-surface"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/auksionlar"
          className="font-condensed text-sm font-bold uppercase tracking-wide text-turbo-red"
        >
          Barcha auksionlarni ko&apos;rish →
        </Link>
      </div>
    </section>
  );
}
