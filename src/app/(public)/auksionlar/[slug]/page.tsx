"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTurboStore } from "@/lib/store";
import CarIllustration from "@/components/CarIllustration";
import StatusBadge from "@/components/StatusBadge";
import PriceTag from "@/components/PriceTag";
import CountdownTimer from "@/components/CountdownTimer";
import LiveBidFeed from "@/components/LiveBidFeed";
import AuctionCard from "@/components/AuctionCard";
import { formatNumber, formatSom } from "@/lib/format";

export default function AuctionDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const auctions = useTurboStore((s) => s.auctions);
  const placeBid = useTurboStore((s) => s.placeBid);
  const unlockedAuctions = useTurboStore((s) => s.unlockedAuctions);
  const redeemCode = useTurboStore((s) => s.redeemCode);
  const accessCodes = useTurboStore((s) => s.accessCodes);

  const auction = auctions.find((a) => a.slug === params.slug);

  const [name, setName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const related = useMemo(
    () =>
      auctions
        .filter((a) => a.id !== auction?.id)
        .sort((a) => (a.status === "live" ? -1 : 1))
        .slice(0, 3),
    [auctions, auction?.id]
  );

  if (auctions.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-96 animate-pulse rounded-2xl border border-turbo-border bg-turbo-surface" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-white">Auksion topilmadi</h1>
        <p className="mt-3 text-turbo-muted">
          Ushbu auksion mavjud emas yoki o&apos;chirilgan bo&apos;lishi mumkin.
        </p>
        <Link
          href="/auksionlar"
          className="mt-6 inline-block rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white"
        >
          Auksionlarga qaytish
        </Link>
      </div>
    );
  }

  const minNext = auction.currentPrice + auction.bidStep;
  const isUnlocked = unlockedAuctions.includes(auction.id);
  const isLocked = auction.requiresDeposit && !isUnlocked;
  const demoCode = accessCodes.find(
    (c) => c.auctionId === auction.id && c.holderName === "Demo" && !c.redeemedAt
  );

  async function submitCode() {
    setCodeError(null);
    if (!auction) return;
    const result = await redeemCode(auction.id, codeInput);
    if (result === "invalid") setCodeError("Kod noto'g'ri. Qaytadan tekshirib ko'ring.");
    else if (result === "used") setCodeError("Bu kod allaqachon ishlatilgan.");
    else setCodeInput("");
  }

  function submitBid(amount: number) {
    setError(null);
    setSuccess(null);
    if (!auction) return;
    if (auction.status !== "live") {
      setError("Bu auksion hozir faol emas.");
      return;
    }
    if (!name.trim()) {
      setError("Iltimos, ismingizni kiriting.");
      return;
    }
    if (amount < minNext) {
      setError(`Taklif kamida ${formatSom(minNext)} bo'lishi kerak.`);
      return;
    }
    placeBid(auction.id, name.trim(), amount).catch(() =>
      setError("Taklifni yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    );
    setSuccess("Taklifingiz qabul qilindi!");
    setCustomAmount("");
    setTimeout(() => setSuccess(null), 2500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-turbo-muted hover:text-white"
      >
        ← Orqaga
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative h-72 overflow-hidden rounded-2xl border border-turbo-border sm:h-96">
            <CarIllustration accent={auction.accent} label={auction.title} className="h-full w-full" />
            <div className="absolute left-4 top-4">
              <StatusBadge status={auction.status} />
            </div>
          </div>

          <h1 className="mt-6 font-display text-3xl text-white sm:text-4xl">{auction.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-turbo-muted">
            <span>{auction.year}-yil</span>
            <span>{formatNumber(auction.mileageKm)} km</span>
            <span>{auction.transmission}</span>
            <span>{auction.fuel}</span>
            <span>{auction.city}</span>
          </div>

          <p className="mt-6 leading-relaxed text-turbo-muted">{auction.description}</p>

          <div className="mt-8">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              Barcha takliflar ({auction.bids.length})
            </h2>
            <div className="mt-4">
              <LiveBidFeed bids={auction.bids} maxItems={20} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
            {auction.status === "ended" ? (
              <div className="rounded-xl border border-turbo-gold/30 bg-turbo-gold/10 p-4 text-center">
                <p className="font-condensed text-xs font-bold uppercase tracking-wider text-turbo-gold">
                  Savdo yakunlandi
                </p>
                <p className="mt-2 font-display text-2xl text-white">
                  {auction.winnerName ?? "G'olibsiz"}
                </p>
                <p className="mt-1 text-sm text-turbo-muted">g&apos;olib deb topildi</p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wide text-turbo-muted">
                  {auction.status === "upcoming" ? "Boshlanishiga qoldi" : "Tugashiga qoldi"}
                </p>
                <CountdownTimer
                  targetMs={auction.status === "upcoming" ? auction.startAt : auction.endAt}
                  size="lg"
                />
              </>
            )}

            <div className="mt-5 border-t border-turbo-border pt-5">
              <p className="text-xs uppercase tracking-wide text-turbo-muted">
                {auction.status === "upcoming" ? "Boshlang'ich narx" : "Joriy narx"}
              </p>
              <PriceTag amount={auction.currentPrice} size="xl" />
              <p className="mt-1 text-xs text-turbo-muted">
                Har bir qadam: {formatSom(auction.bidStep)}
              </p>
              {auction.requiresDeposit && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-turbo-gold/30 bg-turbo-gold/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-turbo-gold">
                  🔒 Depozit: {formatSom(auction.depositAmount)}
                  {isUnlocked && " · ruxsat faol"}
                </p>
              )}
            </div>

            {auction.status === "live" && isLocked && (
              <div className="mt-6 space-y-3 border-t border-turbo-border pt-5">
                <p className="text-sm text-white">
                  Bu auksionda ishtirok etish uchun oldindan{" "}
                  <span className="font-semibold">{formatSom(auction.depositAmount)}</span>{" "}
                  depozit to&apos;lovi va ruxsat kodi talab qilinadi.
                </p>
                <p className="text-xs text-turbo-muted">
                  To&apos;lovni amalga oshirgach, sizga yuborilgan kodni shu yerga kiriting.
                </p>
                <div className="flex gap-2">
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ruxsat kodi"
                    className="flex-1 rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm uppercase tracking-widest text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
                  />
                  <button
                    onClick={submitCode}
                    className="rounded-xl bg-turbo-gold px-5 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide text-turbo-black hover:brightness-95"
                  >
                    Faollashtirish
                  </button>
                </div>
                {codeError && <p className="text-sm text-turbo-red">{codeError}</p>}
                {demoCode && (
                  <p className="text-xs text-turbo-muted">
                    Demo uchun namuna kod: <span className="text-white">{demoCode.code}</span>
                  </p>
                )}
              </div>
            )}

            {auction.status === "live" && !isLocked && (
              <div className="mt-6 space-y-4 border-t border-turbo-border pt-5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ismingiz"
                  className="w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => submitBid(minNext)}
                    className="rounded-xl bg-turbo-red px-4 py-3 font-condensed text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-[1.02]"
                  >
                    +1 qadam
                    <span className="block text-[11px] font-normal normal-case opacity-80">
                      {formatSom(minNext)}
                    </span>
                  </button>
                  <button
                    onClick={() => submitBid(auction.currentPrice + auction.bidStep * 3)}
                    className="rounded-xl border border-turbo-red/50 px-4 py-3 font-condensed text-sm font-bold uppercase tracking-wide text-turbo-red transition-colors hover:bg-turbo-red/10"
                  >
                    +3 qadam
                    <span className="block text-[11px] font-normal normal-case opacity-80">
                      {formatSom(auction.currentPrice + auction.bidStep * 3)}
                    </span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder={`Kamida ${formatSom(minNext)}`}
                    className="flex-1 rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
                  />
                  <button
                    onClick={() => submitBid(Number(customAmount) || 0)}
                    className="rounded-xl border border-turbo-border px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide text-white hover:border-turbo-red hover:text-turbo-red"
                  >
                    Taklif
                  </button>
                </div>

                {error && <p className="text-sm text-turbo-red">{error}</p>}
                {success && <p className="text-sm text-turbo-green">{success}</p>}
              </div>
            )}

            {auction.status === "upcoming" && (
              <div className="mt-6 rounded-xl border border-dashed border-turbo-border p-4 text-center text-sm text-turbo-muted">
                <p>
                  Bu auksion hali boshlanmagan. Taklif berish savdo
                  boshlanganidan so&apos;ng faollashadi.
                </p>
                {auction.requiresDeposit && (
                  <p className="mt-2 text-turbo-gold">
                    Ishtirok etish uchun oldindan {formatSom(auction.depositAmount)}{" "}
                    depozit va ruxsat kodi talab qilinadi.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
            O&apos;xshash auksionlar
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
