"use client";

import { useEffect, useState } from "react";

export default function CurrencyConverter({ fxBuffer }: { fxBuffer: number }) {
  const [rate, setRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");

  useEffect(() => {
    let cancelled = false;
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const krw = data?.rates?.KRW;
        if (typeof krw === "number") setRate(krw);
        else setError("Kurs topilmadi.");
      })
      .catch(() => {
        if (!cancelled) setError("Kursni yuklab bo'lmadi. Birozdan so'ng qaytadan urinib ko'ring.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const buffered = rate ? rate - fxBuffer : null;
  const usd = Number(amount) || 0;

  return (
    <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-6">
      <p className="text-xs uppercase tracking-wide text-turbo-muted">USD → KRW</p>

      {error ? (
        <p className="mt-3 text-sm text-turbo-red">{error}</p>
      ) : rate === null ? (
        <p className="mt-3 text-sm text-turbo-muted">Yuklanmoqda...</p>
      ) : (
        <>
          <p className="mt-1 font-display text-3xl text-white">
            {buffered?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            <span className="ml-2 text-sm text-turbo-muted">TURBO kursi</span>
          </p>

          <div className="mt-5 flex items-center gap-3 border-t border-turbo-border pt-5">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-32 rounded-xl border border-turbo-border bg-turbo-black px-3 py-2 text-sm text-white focus:border-turbo-red focus:outline-none"
            />
            <span className="text-sm text-turbo-muted">USD =</span>
            <span className="font-condensed text-lg font-bold text-white">
              {buffered ? (usd * buffered).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"} KRW
            </span>
          </div>
        </>
      )}
    </div>
  );
}
