import { AuctionStatus } from "@/lib/types";

const CONFIG: Record<AuctionStatus, { label: string; className: string; dot: string }> = {
  live: {
    label: "Jonli savdo",
    className: "bg-turbo-red/15 text-turbo-red border-turbo-red/40",
    dot: "bg-turbo-red animate-pulse",
  },
  upcoming: {
    label: "Tez orada",
    className: "bg-turbo-gold/10 text-turbo-gold border-turbo-gold/30",
    dot: "bg-turbo-gold",
  },
  ended: {
    label: "Yakunlandi",
    className: "bg-white/5 text-turbo-muted border-white/10",
    dot: "bg-turbo-muted",
  },
};

export default function StatusBadge({ status }: { status: AuctionStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-condensed text-xs font-bold uppercase tracking-wider ${c.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
