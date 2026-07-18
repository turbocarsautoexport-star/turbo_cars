"use client";

import { Bid } from "@/lib/types";
import { formatSom, timeAgo, initials } from "@/lib/format";
import { useMounted } from "@/lib/useMounted";
import { useNow } from "@/lib/useNow";

export default function LiveBidFeed({ bids, maxItems = 8 }: { bids: Bid[]; maxItems?: number }) {
  const mounted = useMounted();
  // "x soniya oldin" labels only need coarse refreshes, not a 1s re-render.
  const now = useNow(10_000);

  const items = [...bids].reverse().slice(0, maxItems);

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-turbo-border p-4 text-center text-sm text-turbo-muted">
        Hali takliflar yo&apos;q. Birinchi bo&apos;lib taklif bering!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((bid, i) => (
        <li
          key={bid.id}
          className={`flex items-center justify-between rounded-xl border border-turbo-border bg-turbo-surface px-3 py-2.5 ${
            i === 0 ? "animate-feed-in border-turbo-red/40" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-turbo-red/15 font-condensed text-xs font-bold text-turbo-red">
              {initials(bid.bidderName)}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{bid.bidderName}</p>
              <p className="text-xs text-turbo-muted">
                {mounted ? timeAgo(bid.createdAt, now) : " "}
              </p>
            </div>
          </div>
          <span className="font-display text-sm text-white sm:text-base">
            {formatSom(bid.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
