"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as carsApi from "@/lib/queries/cars";
import { Car, CarStatus } from "@/lib/types";

const STATUS_LABEL: Record<CarStatus, string> = {
  in_stock: "Sotuvda",
  transit: "Yo'lda",
  sold: "Sotildi",
};

export default function PanelCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [category, setCategory] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [status, setStatus] = useState<CarStatus>("in_stock");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const supabase = createClient();
    setCars(await carsApi.getCars(supabase));
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {
        setError("Ma'lumotlarni yuklab bo'lmadi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      await carsApi.createCar(supabase, {
        model: model.trim(),
        year: Number(year) || new Date().getFullYear(),
        category: category.trim() || undefined,
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
        status,
      });
      setModel("");
      setCategory("");
      setPhotoUrl("");
      setStatus("in_stock");
      await refresh();
    } catch {
      setError("Avtomobilni qo'shib bo'lmadi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(car: Car, next: CarStatus) {
    const supabase = createClient();
    await carsApi.updateCar(supabase, car.id, { status: next });
    await refresh();
  }

  async function handleDelete(car: Car) {
    if (!confirm(`"${car.model}" o'chirilsinmi?`)) return;
    const supabase = createClient();
    await carsApi.deleteCar(supabase, car.id);
    await refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Avtomobillar
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Eksport katalogi</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi avtomobil qo&apos;shish
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              placeholder="Hyundai Palisade"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Yil</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Turkum</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="sedan / suv"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Holati</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CarStatus)}
              className={inputCls}
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Rasm URL (ixtiyoriy)</label>
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
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

      {error && <p className="mt-4 text-sm text-turbo-red">{error}</p>}

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha avtomobillar ({cars.length})
        </h2>
        <div className="mt-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : cars.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali avtomobil qo&apos;shilmagan.</p>
          ) : (
            <div className="divide-y divide-turbo-border">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-condensed text-base font-bold text-white">
                      {car.model} <span className="text-turbo-muted">· {car.year}</span>
                    </p>
                    {car.category && <p className="text-xs text-turbo-muted">{car.category}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={car.status}
                      onChange={(e) => handleStatusChange(car, e.target.value as CarStatus)}
                      className="rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-xs text-white focus:border-turbo-red focus:outline-none"
                    >
                      {Object.entries(STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(car)}
                      className="rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                    >
                      O&apos;chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
