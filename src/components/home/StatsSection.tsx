"use client";

import { useMemo, useState } from "react";
import { useTurboStore } from "@/lib/store";
import AnimatedCounter from "../AnimatedCounter";
import { formatCompactSom, formatNumber } from "@/lib/format";
import { buildStatsSeries, StatsPeriod } from "@/lib/statsData";
import { useMounted } from "@/lib/useMounted";
import PeriodTabs from "../charts/PeriodTabs";
import LineAreaChart from "../charts/LineAreaChart";
import BarChart from "../charts/BarChart";

export default function StatsSection() {
  const stats = useTurboStore((s) => s.stats);
  const auctions = useTurboStore((s) => s.auctions);
  const now = useTurboStore((s) => s.now);
  const mounted = useMounted();
  const endedCount = auctions.filter((a) => a.status === "ended").length;

  const [period, setPeriod] = useState<StatsPeriod>("30d");

  const { sales, counts } = useMemo(() => buildStatsSeries(period, now), [period, now]);

  const items = [
    {
      label: "Jami o'tkazilgan savdolar",
      value: stats.totalAuctions,
      formatter: (n: number) => Math.round(n).toLocaleString("uz-UZ"),
    },
    {
      label: "Umumiy savdo summasi",
      value: stats.totalSoldSom,
      formatter: (n: number) => formatCompactSom(n),
    },
    {
      label: "Faol ishtirokchilar",
      value: stats.activeBidders,
      formatter: (n: number) => Math.round(n).toLocaleString("uz-UZ"),
    },
    {
      label: "O'rtacha savdo davomiyligi",
      value: stats.avgSaleMinutes,
      formatter: (n: number) => `${Math.round(n)} daqiqa`,
    },
  ];

  return (
    <section id="statistika" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Statistika
      </p>
      <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
        Raqamlarda TURBO
      </h2>
      <p className="mt-2 max-w-xl text-sm text-turbo-muted">
        Platformamizdagi so&apos;nggi faoliyat ko&apos;rsatkichlari — shu jumladan
        hozirgacha yakunlangan {endedCount} ta namunaviy savdo asosida.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-turbo-border bg-turbo-surface p-6 text-center"
          >
            <p className="font-display text-3xl text-turbo-red sm:text-4xl">
              <AnimatedCounter value={item.value} formatter={item.formatter} />
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-turbo-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Vaqt bo&apos;yicha dinamika
        </h3>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-5">
          <p className="mb-1 font-condensed text-xs font-bold uppercase tracking-wider text-turbo-muted">
            Savdo summasi
          </p>
          {/* colors validated against dark surface #1a1615 via dataviz skill validator */}
          {mounted ? (
            <LineAreaChart
              data={sales}
              color="#e8484c"
              valueFormatter={(n) => formatCompactSom(n)}
              ariaLabel="Davr bo'yicha savdo summasi grafigi"
            />
          ) : (
            <div className="h-56 animate-pulse rounded-xl bg-turbo-black-soft" />
          )}
        </div>

        <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-5">
          <p className="mb-1 font-condensed text-xs font-bold uppercase tracking-wider text-turbo-muted">
            Yakunlangan auksionlar soni
          </p>
          {mounted ? (
            <BarChart
              data={counts}
              color="#199e70"
              valueFormatter={(n) => `${formatNumber(n)} ta`}
              ariaLabel="Davr bo'yicha auksionlar soni grafigi"
            />
          ) : (
            <div className="h-56 animate-pulse rounded-xl bg-turbo-black-soft" />
          )}
        </div>
      </div>
    </section>
  );
}
