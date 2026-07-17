"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as ordersApi from "@/lib/queries/orders";
import * as carsApi from "@/lib/queries/cars";
import * as containersApi from "@/lib/queries/containers";
import { Car, Container, Order } from "@/lib/types";

export default function PanelOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  const [guestName, setGuestName] = useState("");
  const [carId, setCarId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function refresh() {
    const supabase = createClient();
    const [o, c, ct] = await Promise.all([
      ordersApi.getOrders(supabase),
      carsApi.getCars(supabase),
      containersApi.getContainers(supabase),
    ]);
    setOrders(o);
    setCars(c);
    setContainers(ct);
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
    setLastCode(null);
    try {
      const supabase = createClient();
      const order = await ordersApi.createOrder(supabase, {
        guestName: guestName.trim(),
        carId: carId || undefined,
        containerId: containerId || undefined,
        statusNote: statusNote.trim() || undefined,
      });
      setLastCode(order.trackingCode);
      setGuestName("");
      setCarId("");
      setContainerId("");
      setStatusNote("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNoteChange(order: Order, note: string) {
    const supabase = createClient();
    await ordersApi.updateOrder(supabase, order.id, { statusNote: note });
    await refresh();
  }

  async function handleDelete(order: Order) {
    if (!confirm("Bu buyurtma o'chirilsinmi?")) return;
    const supabase = createClient();
    await ordersApi.deleteOrder(supabase, order.id);
    await refresh();
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Buyurtmalar
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Buyurtma kuzatuvi</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi buyurtma yaratish
        </h2>
        <p className="mt-1 mb-4 text-sm text-turbo-muted">
          Har bir buyurtma uchun kuzatuv kodi avtomatik yaratiladi — uni mijozga bering.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Mijoz ismi</label>
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Avtomobil (ixtiyoriy)</label>
            <select value={carId} onChange={(e) => setCarId(e.target.value)} className={inputCls}>
              <option value="">— tanlanmagan —</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.model} ({c.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Konteyner (ixtiyoriy)</label>
            <select value={containerId} onChange={(e) => setContainerId(e.target.value)} className={inputCls}>
              <option value="">— tanlanmagan —</option>
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.containerNumber || c.originPort + " → " + c.destinationPort}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Holat izohi (mijozga ko&apos;rinadi)</label>
            <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {submitting ? "Yaratilmoqda..." : "Yaratish"}
            </button>
            {lastCode && (
              <span className="ml-4 text-sm text-turbo-green">
                Kuzatuv kodi: <span className="font-display tracking-widest text-white">{lastCode}</span>
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha buyurtmalar ({orders.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali buyurtma yaratilmagan.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.guestName}</p>
                    <button
                      onClick={() => copy(order.trackingCode)}
                      className="mt-0.5 font-display text-sm tracking-widest text-turbo-muted hover:text-white"
                    >
                      {copiedId === order.trackingCode ? "Nusxalandi ✓" : order.trackingCode}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(order)}
                    className="rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                  >
                    O&apos;chirish
                  </button>
                </div>
                <input
                  defaultValue={order.statusNote}
                  onBlur={(e) => handleNoteChange(order, e.target.value)}
                  placeholder="Holat izohi..."
                  className="mt-2 w-full rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-xs text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
