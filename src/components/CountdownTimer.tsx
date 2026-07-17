"use client";

import { useTurboStore } from "@/lib/store";
import { getCountdown, pad2 } from "@/lib/format";
import { useMounted } from "@/lib/useMounted";

interface CountdownTimerProps {
  targetMs: number;
  size?: "sm" | "md" | "lg";
  urgentBelowMinutes?: number;
}

export default function CountdownTimer({
  targetMs,
  size = "md",
  urgentBelowMinutes = 5,
}: CountdownTimerProps) {
  const mounted = useMounted();
  const now = useTurboStore((s) => s.now);

  const sizes = {
    sm: "text-sm gap-1",
    md: "text-lg gap-1.5",
    lg: "text-3xl sm:text-4xl gap-2",
  } as const;

  if (!mounted) {
    return (
      <div className={`font-display flex items-baseline text-white ${sizes[size]}`}>
        <span>--:--:--</span>
      </div>
    );
  }

  const cd = getCountdown(targetMs, now);
  const urgent = !cd.isOver && cd.totalMs < urgentBelowMinutes * 60_000;

  return (
    <div
      className={`font-display flex items-baseline ${sizes[size]} ${
        urgent ? "text-turbo-red animate-glow" : "text-white"
      }`}
    >
      {cd.isOver ? (
        <span>Yakunlandi</span>
      ) : (
        <>
          {cd.days > 0 && <span>{cd.days}k </span>}
          <span>{pad2(cd.hours)}</span>
          <span className="opacity-50">:</span>
          <span>{pad2(cd.minutes)}</span>
          <span className="opacity-50">:</span>
          <span>{pad2(cd.seconds)}</span>
        </>
      )}
    </div>
  );
}
