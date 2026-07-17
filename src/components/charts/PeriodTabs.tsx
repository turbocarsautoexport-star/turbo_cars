import { PERIOD_LABELS, StatsPeriod } from "@/lib/statsData";

const ORDER: StatsPeriod[] = ["7d", "30d", "6m", "1y"];

interface PeriodTabsProps {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
}

export default function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORDER.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-full border px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wide transition-colors ${
            value === p
              ? "border-turbo-red bg-turbo-red text-white"
              : "border-turbo-border text-turbo-muted hover:border-turbo-red/50 hover:text-white"
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
