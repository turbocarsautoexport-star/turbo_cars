interface ChartTooltipProps {
  leftPercent: number;
  label: string;
  value: string;
  color: string;
}

export default function ChartTooltip({ leftPercent, label, value, color }: ChartTooltipProps) {
  const edge = leftPercent < 12 ? "left" : leftPercent > 88 ? "right" : "center";
  const translate =
    edge === "left" ? "0%" : edge === "right" ? "-100%" : "-50%";

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 rounded-lg border border-turbo-border bg-turbo-black-soft px-3 py-2 shadow-lg"
      style={{ left: `${leftPercent}%`, transform: `translateX(${translate})` }}
    >
      <p className="text-[11px] text-turbo-muted">{label}</p>
      <p className="flex items-center gap-1.5 font-condensed text-sm font-bold text-white">
        <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
        {value}
      </p>
    </div>
  );
}
