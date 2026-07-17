"use client";

import { FormEvent, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { trackOrder } from "@/lib/queries/orders";
import { OrderLookup } from "@/lib/types";

const CAR_STATUS_LABEL: Record<string, string> = {
  in_stock: "Sotuvda",
  transit: "Yo'lda",
  sold: "Yetkazib berildi",
};

const CONTAINER_STATUS_LABEL: Record<string, string> = {
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  arrived: "Yetib keldi",
  cleared: "Bojxonadan o'tdi",
};

export default function PortalTrackOrderPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<OrderLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const supabase = createClient();
      const found = await trackOrder(supabase, code.trim());
      if (!found) setError("Bunday kod bilan buyurtma topilmadi. Kodni tekshirib qaytadan urinib ko'ring.");
      else setResult(found);
    } catch {
      setError("Qidirishda xatolik yuz berdi. Birozdan so'ng qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Buyurtma
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Buyurtmani kuzatish</h1>
      <p className="mt-2 max-w-xl text-sm text-turbo-muted">
        TURBO sizga bergan kuzatuv kodini kiriting.
      </p>

      {!isSupabaseConfigured ? (
        <p className="mt-8 rounded-2xl border border-dashed border-turbo-border p-6 text-sm text-turbo-muted">
          Bu xizmat hali ulanmagan.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-8 flex max-w-md gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Masalan: T7K3N9QX"
              className="flex-1 rounded-xl border border-turbo-border bg-turbo-surface px-4 py-2.5 text-sm uppercase tracking-widest text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-turbo-red px-5 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
            >
              {loading ? "Qidirilmoqda..." : "Qidirish"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-turbo-red">{error}</p>}

          {result && (
            <div className="mt-6 max-w-md rounded-2xl border border-turbo-border bg-turbo-surface p-6">
              <p className="text-xs uppercase tracking-wide text-turbo-muted">
                {result.guestName}
              </p>
              {result.carModel && (
                <p className="mt-2 font-condensed text-lg font-bold text-white">
                  {result.carModel} {result.carYear ? `(${result.carYear})` : ""}
                  {result.carStatus && (
                    <span className="ml-2 text-sm font-normal text-turbo-muted">
                      — {CAR_STATUS_LABEL[result.carStatus] ?? result.carStatus}
                    </span>
                  )}
                </p>
              )}
              {result.containerStatus && (
                <p className="mt-2 text-sm text-turbo-muted">
                  Yuk holati:{" "}
                  <span className="text-white">
                    {CONTAINER_STATUS_LABEL[result.containerStatus] ?? result.containerStatus}
                  </span>
                  {result.containerOriginPort && result.containerDestinationPort && (
                    <> · {result.containerOriginPort} → {result.containerDestinationPort}</>
                  )}
                </p>
              )}
              {result.statusNote && (
                <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-white">
                  {result.statusNote}
                </p>
              )}
              <p className="mt-4 text-xs text-turbo-muted">
                Oxirgi yangilanish: {new Date(result.updatedAt).toLocaleString("uz-UZ")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
