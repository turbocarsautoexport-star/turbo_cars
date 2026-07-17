"use client";

import Link from "next/link";
import { useTurboStore } from "@/lib/store";
import AnimatedCounter from "../AnimatedCounter";
import { formatCompactSom } from "@/lib/format";

export default function Hero() {
  const auctions = useTurboStore((s) => s.auctions);
  const stats = useTurboStore((s) => s.stats);
  const liveCount = auctions.filter((a) => a.status === "live").length;

  return (
    <section className="relative overflow-hidden border-b border-turbo-border bg-turbo-black">
      <div className="speed-lines absolute inset-0 opacity-60" />
      <div
        className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--turbo-red)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-turbo-red/40 bg-turbo-red/10 px-3 py-1 font-condensed text-xs font-bold uppercase tracking-widest text-turbo-red">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-turbo-red" />
            {liveCount} ta auksion hozir jonli
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] text-white sm:text-6xl">
            Mashinalar bo&apos;yicha{" "}
            <span className="text-gradient-red">kim oshdi savdosi</span> —
            real vaqtda
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-turbo-muted sm:text-lg">
            TURBO platformasida narxlar har soniyada jonli o&apos;sadi, har bir
            savdo aniq belgilangan taймер bilan boshqariladi va yakunida
            g&apos;olib avtomatik aniqlanadi. Shaffof, tez va qiziqarli.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auksionlar"
              className="rounded-full bg-turbo-red px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_30px_-10px_rgba(246,6,10,0.7)] transition-transform hover:scale-105"
            >
              Jonli savdolarni ko&apos;rish
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-turbo-border px-7 py-3.5 font-condensed text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-turbo-red hover:text-turbo-red"
            >
              Admin sifatida kirish
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-turbo-border pt-8 sm:max-w-lg">
            <div>
              <p className="font-display text-2xl text-white sm:text-3xl">
                <AnimatedCounter value={stats.totalAuctions} />
              </p>
              <p className="mt-1 text-xs text-turbo-muted">O&apos;tkazilgan savdolar</p>
            </div>
            <div>
              <p className="font-display text-2xl text-white sm:text-3xl">
                <AnimatedCounter
                  value={stats.totalSoldSom}
                  formatter={(n) => formatCompactSom(n)}
                />
              </p>
              <p className="mt-1 text-xs text-turbo-muted">Umumiy savdo summasi</p>
            </div>
            <div>
              <p className="font-display text-2xl text-white sm:text-3xl">
                <AnimatedCounter value={stats.activeBidders} />
              </p>
              <p className="mt-1 text-xs text-turbo-muted">Faol ishtirokchilar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
