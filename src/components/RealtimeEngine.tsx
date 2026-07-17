"use client";

import { useEffect } from "react";
import { useTurboStore } from "@/lib/store";

export default function RealtimeEngine() {
  const init = useTurboStore((s) => s.init);
  const tick = useTurboStore((s) => s.tick);
  const simulateRandomBid = useTurboStore((s) => s.simulateRandomBid);

  useEffect(() => {
    init();
    const tickInterval = setInterval(tick, 1000);

    let bidTimeout: ReturnType<typeof setTimeout>;
    const scheduleBid = () => {
      const delay = 2500 + Math.random() * 4500;
      bidTimeout = setTimeout(() => {
        simulateRandomBid();
        scheduleBid();
      }, delay);
    };
    scheduleBid();

    return () => {
      clearInterval(tickInterval);
      clearTimeout(bidTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
