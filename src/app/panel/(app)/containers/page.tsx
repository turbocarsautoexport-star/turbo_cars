"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as containersApi from "@/lib/queries/containers";
import { Container, ContainerCustomsStatus, ContainerStatus } from "@/lib/types";

const STATUS_LABEL: Record<ContainerStatus, string> = {
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  arrived: "Yetib keldi",
  cleared: "Bojxonadan o'tdi",
};

const CUSTOMS_LABEL: Record<ContainerCustomsStatus, string> = {
  pending: "Kutilmoqda",
  filed: "Topshirilgan",
  in_progress: "Jarayonda",
  held: "Ushlab qolingan",
  cleared: "Tozalangan",
};

export default function PanelContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [containerNumber, setContainerNumber] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [status, setStatus] = useState<ContainerStatus>("preparing");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const supabase = createClient();
    setContainers(await containersApi.getContainers(supabase));
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
      await containersApi.createContainer(supabase, {
        originPort: originPort.trim(),
        destinationPort: destinationPort.trim(),
        containerNumber: containerNumber.trim() || undefined,
        vesselName: vesselName.trim() || undefined,
        arrivalDate: arrivalDate || undefined,
        customsStatus: "pending",
        status,
      });
      setOriginPort("");
      setDestinationPort("");
      setContainerNumber("");
      setVesselName("");
      setArrivalDate("");
      setStatus("preparing");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(c: Container, next: ContainerStatus) {
    const supabase = createClient();
    await containersApi.updateContainer(supabase, c.id, { status: next });
    await refresh();
  }

  async function handleCustomsChange(c: Container, next: ContainerCustomsStatus) {
    const supabase = createClient();
    await containersApi.updateContainer(supabase, c.id, { customsStatus: next });
    await refresh();
  }

  async function handleDelete(c: Container) {
    if (!confirm("Bu konteyner o'chirilsinmi?")) return;
    const supabase = createClient();
    await containersApi.deleteContainer(supabase, c.id);
    await refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Logistika
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Konteynerlar</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi konteyner
        </h2>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Konteyner raqami</label>
            <input value={containerNumber} onChange={(e) => setContainerNumber(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Kema nomi</label>
            <input value={vesselName} onChange={(e) => setVesselName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Jo&apos;natish porti</label>
            <input value={originPort} onChange={(e) => setOriginPort(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Qabul porti</label>
            <input value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Kelish sanasi</label>
            <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Holati</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ContainerStatus)} className={inputCls}>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
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
          Barcha konteynerlar ({containers.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : containers.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali konteyner qo&apos;shilmagan.</p>
          ) : (
            containers.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-condensed text-base font-bold text-white">
                    {c.containerNumber || "—"} · {c.originPort} → {c.destinationPort}
                  </p>
                  <p className="text-xs text-turbo-muted">{c.vesselName || "Kema belgilanmagan"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c, e.target.value as ContainerStatus)}
                    className="rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-xs text-white focus:border-turbo-red focus:outline-none"
                  >
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.customsStatus}
                    onChange={(e) => handleCustomsChange(c, e.target.value as ContainerCustomsStatus)}
                    className="rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-xs text-white focus:border-turbo-red focus:outline-none"
                  >
                    {Object.entries(CUSTOMS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(c)}
                    className="rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                  >
                    O&apos;chirish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
