"use client";

import { FormEvent, useMemo, useState } from "react";
import { useTurboStore } from "@/lib/store";
import { Auction } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import CountdownTimer from "@/components/CountdownTimer";
import PriceTag from "@/components/PriceTag";
import { formatSom } from "@/lib/format";

const DEMO_PASSWORD = "turbo2026";

function DepositPanel({ auction }: { auction: Auction }) {
  const adminSetDeposit = useTurboStore((s) => s.adminSetDeposit);
  const adminGenerateCode = useTurboStore((s) => s.adminGenerateCode);
  const allCodes = useTurboStore((s) => s.accessCodes);
  const codes = useMemo(
    () => allCodes.filter((c) => c.auctionId === auction.id),
    [allCodes, auction.id]
  );
  const [amount, setAmount] = useState(String(auction.depositAmount || 5_000_000));
  const [holderName, setHolderName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(code: string, id: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="mt-3 rounded-xl border border-turbo-border bg-turbo-black/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={auction.requiresDeposit}
            onChange={(e) => adminSetDeposit(auction.id, e.target.checked, Number(amount) || 0)}
            className="h-4 w-4 accent-turbo-red"
          />
          Oldindan to&apos;lov talab qilinsin
        </label>
        {auction.requiresDeposit && (
          <div className="flex items-center gap-2">
            <input
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setAmount(v);
                adminSetDeposit(auction.id, true, Number(v) || 0);
              }}
              className="w-32 rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-sm text-white focus:border-turbo-red focus:outline-none"
            />
            <span className="text-xs text-turbo-muted">so&apos;m depozit</span>
          </div>
        )}
      </div>

      {auction.requiresDeposit && (
        <div className="mt-4 border-t border-turbo-border pt-4">
          <p className="mb-2 text-xs text-turbo-muted">
            To&apos;lov qilgan mijoz uchun bir martalik kod yarating va uni
            o&apos;zingiz (Telegram/SMS orqali) mijozga yuboring.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Mijoz ismi (ixtiyoriy)"
              className="min-w-[180px] flex-1 rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
            />
            <button
              onClick={() => {
                adminGenerateCode(auction.id, holderName);
                setHolderName("");
              }}
              className="rounded-lg bg-turbo-red px-4 py-1.5 font-condensed text-xs font-bold uppercase tracking-wide text-white"
            >
              Kod yaratish
            </button>
          </div>

          {codes.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {codes.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-turbo-surface-2 px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-display tracking-widest text-white">{c.code}</span>
                    {c.holderName && (
                      <span className="ml-2 text-xs text-turbo-muted">{c.holderName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        c.redeemedAt ? "text-turbo-muted" : "text-turbo-green"
                      }`}
                    >
                      {c.redeemedAt ? "Ishlatilgan" : "Faol"}
                    </span>
                    <button
                      onClick={() => copy(c.code, c.id)}
                      className="text-xs text-turbo-muted hover:text-white"
                    >
                      {copiedId === c.id ? "Nusxalandi" : "Nusxalash"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AdminAuctionRow({ auction }: { auction: Auction }) {
  const adminStartAuction = useTurboStore((s) => s.adminStartAuction);
  const adminCloseAuction = useTurboStore((s) => s.adminCloseAuction);
  const adminSetTimerMinutes = useTurboStore((s) => s.adminSetTimerMinutes);
  const [minutes, setMinutes] = useState("10");
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="border-b border-turbo-border py-5 last:border-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-condensed text-base font-bold text-white">
              {auction.title}
            </h3>
            <StatusBadge status={auction.status} />
            {auction.requiresDeposit && (
              <span className="rounded-full border border-turbo-gold/30 bg-turbo-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-turbo-gold">
                Depozit {formatSom(auction.depositAmount)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-turbo-muted">
            {auction.year} · {auction.city} · {auction.bids.length} ta taklif
          </p>
          <div className="mt-2 flex items-center gap-4">
            <PriceTag amount={auction.currentPrice} size="sm" />
            {auction.status !== "ended" && (
              <CountdownTimer
                targetMs={auction.status === "upcoming" ? auction.startAt : auction.endAt}
                size="sm"
              />
            )}
            {auction.status === "ended" && auction.winnerName && (
              <span className="text-xs text-turbo-muted">
                G&apos;olib: <span className="text-white">{auction.winnerName}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {auction.status === "upcoming" && (
            <button
              onClick={() => adminStartAuction(auction.id)}
              className="rounded-full bg-turbo-green/15 px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-turbo-green hover:bg-turbo-green/25"
            >
              Hozir boshlash
            </button>
          )}

          {auction.status === "live" && (
            <>
              <div className="flex items-center overflow-hidden rounded-full border border-turbo-border">
                <input
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-14 bg-turbo-black px-2 py-2 text-center text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => adminSetTimerMinutes(auction.id, Number(minutes) || 0)}
                  className="bg-turbo-surface-2 px-3 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-white hover:text-turbo-red"
                  title="Taймerni daqiqalarda qayta belgilash"
                >
                  Taймer, daq
                </button>
              </div>
              <button
                onClick={() => adminCloseAuction(auction.id)}
                className="rounded-full bg-turbo-red/15 px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-turbo-red hover:bg-turbo-red/25"
              >
                Hozir yopish
              </button>
            </>
          )}

          <button
            onClick={() => setShowDeposit((v) => !v)}
            className="rounded-full border border-turbo-border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-turbo-muted hover:border-turbo-gold hover:text-turbo-gold"
          >
            {showDeposit ? "Yopish" : "To'lov / kodlar"}
          </button>
        </div>
      </div>

      {showDeposit && <DepositPanel auction={auction} />}
    </div>
  );
}

function CreateAuctionForm() {
  const adminCreateAuction = useTurboStore((s) => s.adminCreateAuction);
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    adminCreateAuction({
      title: String(form.get("title") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      year: Number(form.get("year")) || new Date().getFullYear(),
      mileageKm: Number(form.get("mileageKm")) || 0,
      transmission: form.get("transmission") as Auction["transmission"],
      fuel: form.get("fuel") as Auction["fuel"],
      city: String(form.get("city") || "").trim(),
      description: String(form.get("description") || "").trim(),
      startPrice: Number(form.get("startPrice")) || 0,
      bidStep: Number(form.get("bidStep")) || 500_000,
      durationMinutes: Number(form.get("durationMinutes")) || 15,
      startDelayMinutes: Number(form.get("startDelayMinutes")) || 0,
    });
    setStatus("Auksion muvaffaqiyatli qo'shildi.");
    e.currentTarget.reset();
    setTimeout(() => setStatus(null), 3000);
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelCls}>Sarlavha</label>
        <input name="title" required placeholder="Masalan: Chevrolet Onix" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Brend</label>
        <input name="brand" required placeholder="Chevrolet" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Yil</label>
        <input name="year" type="number" required defaultValue={2023} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Probeg (km)</label>
        <input name="mileageKm" type="number" required defaultValue={10000} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Transmissiya</label>
        <select name="transmission" className={inputCls} defaultValue="Avtomat">
          <option>Avtomat</option>
          <option>Mexanika</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Yoqilg&apos;i</label>
        <select name="fuel" className={inputCls} defaultValue="Benzin">
          <option>Benzin</option>
          <option>Dizel</option>
          <option>Gibrid</option>
          <option>Elektr</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Shahar</label>
        <input name="city" required placeholder="Toshkent" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Boshlang&apos;ich narx (so&apos;m)</label>
        <input name="startPrice" type="number" required defaultValue={150000000} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Bid qadami (so&apos;m)</label>
        <input name="bidStep" type="number" required defaultValue={1000000} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Davomiyligi (daqiqa)</label>
        <input name="durationMinutes" type="number" required defaultValue={15} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Boshlanishi (necha daqiqadan keyin, 0 = hozir)</label>
        <input name="startDelayMinutes" type="number" required defaultValue={0} className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Tavsif</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Avtomobil haqida qisqacha ma'lumot"
          className={inputCls}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
        >
          Auksion yaratish
        </button>
        {status && <span className="ml-4 text-sm text-turbo-green">{status}</span>}
      </div>
    </form>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const auctions = useTurboStore((s) => s.auctions);

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === DEMO_PASSWORD) {
      setAuthed(true);
      setAuthError(null);
    } else {
      setAuthError("Parol noto'g'ri. Demo parol: turbo2026");
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
          Admin panel
        </p>
        <h1 className="mt-1 font-display text-3xl text-white">Kirish</h1>
        <p className="mt-2 text-sm text-turbo-muted">
          Demo rejim: parol — <span className="text-white">turbo2026</span>.
          Backend ulanganda bu yerga to&apos;liq autentifikatsiya qo&apos;shiladi.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol"
            className="w-full rounded-xl border border-turbo-border bg-turbo-surface px-4 py-3 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
          />
          {authError && <p className="text-sm text-turbo-red">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white"
          >
            Kirish
          </button>
        </form>
      </div>
    );
  }

  const liveCount = auctions.filter((a) => a.status === "live").length;
  const upcomingCount = auctions.filter((a) => a.status === "upcoming").length;
  const endedCount = auctions.filter((a) => a.status === "ended").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
            Admin panel
          </p>
          <h1 className="mt-1 font-display text-3xl text-white">Savdolarni boshqarish</h1>
        </div>
        <button
          onClick={() => setAuthed(false)}
          className="rounded-full border border-turbo-border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
        >
          Chiqish
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-4 text-center">
          <p className="font-display text-2xl text-turbo-red">{liveCount}</p>
          <p className="text-xs text-turbo-muted">Jonli</p>
        </div>
        <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-4 text-center">
          <p className="font-display text-2xl text-turbo-gold">{upcomingCount}</p>
          <p className="text-xs text-turbo-muted">Tez orada</p>
        </div>
        <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-4 text-center">
          <p className="font-display text-2xl text-white">{endedCount}</p>
          <p className="text-xs text-turbo-muted">Yakunlangan</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha auksionlar
        </h2>
        <div className="mt-2">
          {auctions.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : (
            auctions.map((a) => <AdminAuctionRow key={a.id} auction={a} />)
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi auksion qo&apos;shish
        </h2>
        <p className="mt-1 mb-6 text-sm text-turbo-muted">
          Yangi mashina savdosini yarating — boshlanish vaqti va davomiyligini
          o&apos;zingiz belgilaysiz.
        </p>
        <CreateAuctionForm />
      </div>

      <p className="mt-6 text-xs text-turbo-muted">
        Eslatma: bu demo rejim, o&apos;zgarishlar faqat joriy brauzer sessiyasida
        saqlanadi. Backend ulanganda bu ma&apos;lumotlar bazasida saqlanadi.
      </p>
    </div>
  );
}
