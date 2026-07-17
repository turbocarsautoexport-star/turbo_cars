import Link from "next/link";
import { Auction } from "@/lib/types";
import CarIllustration from "./CarIllustration";
import StatusBadge from "./StatusBadge";
import PriceTag from "./PriceTag";
import CountdownTimer from "./CountdownTimer";
import { formatNumber, formatSom } from "@/lib/format";

export default function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <Link
      href={`/auksionlar/${auction.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-turbo-border bg-turbo-surface transition-all hover:-translate-y-1 hover:border-turbo-red/50 hover:shadow-[0_0_0_1px_rgba(246,6,10,0.25),0_20px_40px_-20px_rgba(246,6,10,0.35)]"
    >
      <div className="relative h-44">
        <CarIllustration accent={auction.accent} label={auction.title} className="h-full w-full" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={auction.status} />
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 font-condensed text-xs font-bold text-white backdrop-blur">
          {auction.year}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-condensed text-lg font-bold text-white group-hover:text-turbo-red">
            {auction.title}
          </h3>
          {auction.requiresDeposit && (
            <span
              title={`Depozit talab qilinadi: ${formatSom(auction.depositAmount)}`}
              className="shrink-0 rounded-full border border-turbo-gold/30 bg-turbo-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-turbo-gold"
            >
              🔒
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-turbo-muted">
          {auction.city} · {formatNumber(auction.mileageKm)} km · {auction.transmission}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-turbo-muted">
              {auction.status === "upcoming" ? "Boshlang'ich narx" : "Joriy narx"}
            </p>
            <PriceTag amount={auction.currentPrice} size="md" />
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-turbo-muted">
              {auction.status === "ended"
                ? "Yakunlandi"
                : auction.status === "upcoming"
                ? "Boshlanishiga"
                : "Tugashiga"}
            </p>
            <CountdownTimer
              targetMs={auction.status === "upcoming" ? auction.startAt : auction.endAt}
              size="sm"
            />
          </div>
        </div>

        {auction.status === "ended" && auction.winnerName && (
          <p className="mt-3 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-turbo-muted">
            G&apos;olib: <span className="text-white">{auction.winnerName}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
