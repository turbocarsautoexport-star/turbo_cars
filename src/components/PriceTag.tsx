"use client";

import { useEffect, useRef, useState } from "react";
import { formatSom } from "@/lib/format";

interface PriceTagProps {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function PriceTag({ amount, size = "md", className = "" }: PriceTagProps) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(amount);

  useEffect(() => {
    if (prev.current !== amount) {
      prev.current = amount;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [amount]);

  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl sm:text-5xl",
  } as const;

  return (
    <span
      className={`font-display inline-block text-white ${sizes[size]} ${
        pulse ? "animate-price-pulse" : ""
      } ${className}`}
    >
      {formatSom(amount)}
    </span>
  );
}
