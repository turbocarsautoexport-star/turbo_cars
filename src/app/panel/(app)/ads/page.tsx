"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as adsApi from "@/lib/queries/ads";
import * as offersApi from "@/lib/queries/offers";
import { Ad, AdAccent, AdPlacement, AdSection, Offer } from "@/lib/types";

const SECTIONS: AdSection[] = [
  "home",
  "eksport",
  "auksionlar",
  "news",
  "rates",
  "containers",
  "track",
  "offers",
  "catalog",
  "reviews",
  "sold",
  "support",
];
const PLACEMENTS: AdPlacement[] = ["top", "island", "split"];
const ACCENTS: AdAccent[] = ["red", "dark", "gradient"];

function AdsTab() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<AdSection>("home");
  const [placement, setPlacement] = useState<AdPlacement>("top");
  const [accent, setAccent] = useState<AdAccent>("red");
  const [body, setBody] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const supabase = createClient();
    setAds(await adsApi.getAds(supabase));
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      await adsApi.createAd(supabase, {
        section,
        placement,
        accent,
        body: body.trim(),
        ctaLabel: ctaLabel.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        media: mediaUrl.trim() ? [{ type: "photo", url: mediaUrl.trim() }] : [],
      });
      setBody("");
      setCtaLabel("");
      setMediaUrl("");
      setStartDate("");
      setEndDate("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ad: Ad) {
    if (!confirm("Bu reklama o'chirilsinmi?")) return;
    const supabase = createClient();
    await adsApi.deleteAd(supabase, ad.id);
    await refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi reklama
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Bo&apos;lim</label>
            <select value={section} onChange={(e) => setSection(e.target.value as AdSection)} className={inputCls}>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Joylashuv</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value as AdPlacement)} className={inputCls}>
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Uslub</label>
            <select value={accent} onChange={(e) => setAccent(e.target.value as AdAccent)} className={inputCls}>
              {ACCENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>CTA tugma matni</label>
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Batafsil" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Matn</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Rasm URL</label>
            <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Boshlanish sanasi</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tugash sanasi</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha reklamalar ({ads.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : ads.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali reklama qo&apos;shilmagan.</p>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {ad.section} · {ad.placement}
                  </p>
                  <p className="truncate text-xs text-turbo-muted">{ad.body}</p>
                  <p className="mt-0.5 text-[11px] text-turbo-muted">{ad.clicks} bosish</p>
                </div>
                <button
                  onClick={() => handleDelete(ad)}
                  className="shrink-0 rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                >
                  O&apos;chirish
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const supabase = createClient();
    setOffers(await offersApi.getOffers(supabase));
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      await offersApi.createOffer(supabase, {
        title: title.trim(),
        discountText: discountText.trim() || undefined,
        description: description.trim() || undefined,
        publishDate: new Date().toISOString().slice(0, 10),
        validUntil: validUntil || undefined,
      });
      setTitle("");
      setDiscountText("");
      setDescription("");
      setValidUntil("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(offer: Offer) {
    if (!confirm("Bu taklif o'chirilsinmi?")) return;
    const supabase = createClient();
    await offersApi.deleteOffer(supabase, offer.id);
    await refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi taklif
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Sarlavha</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Chegirma matni</label>
            <input value={discountText} onChange={(e) => setDiscountText(e.target.value)} placeholder="-10%" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Tavsif</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Amal qilish muddati</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha takliflar ({offers.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : offers.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali taklif qo&apos;shilmagan.</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{offer.title}</p>
                  {offer.description && (
                    <p className="truncate text-xs text-turbo-muted">{offer.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(offer)}
                  className="shrink-0 rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                >
                  O&apos;chirish
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function PanelAdsPage() {
  const [tab, setTab] = useState<"ads" | "offers">("ads");

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Marketing
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Reklama va takliflar</h1>

      <div className="mt-6 flex gap-2">
        {(["ads", "offers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t
                ? "border-turbo-red bg-turbo-red text-white"
                : "border-turbo-border text-turbo-muted hover:border-turbo-red/50 hover:text-white"
            }`}
          >
            {t === "ads" ? "Reklamalar" : "Takliflar"}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "ads" ? <AdsTab /> : <OffersTab />}</div>
    </div>
  );
}
