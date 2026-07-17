"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as workersApi from "@/lib/queries/workers";
import { WorkerProfile, WorkerRole } from "@/lib/types";
import { inviteWorker } from "./actions";

export default function PanelTeamPage() {
  const [me, setMe] = useState<WorkerProfile | null>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ error?: string; tempPassword?: string } | null>(null);

  async function refresh() {
    const supabase = createClient();
    const [current, all] = await Promise.all([
      workersApi.getCurrentWorker(supabase),
      workersApi.getWorkers(supabase),
    ]);
    setMe(current);
    setWorkers(all);
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    const res = await inviteWorker(formData);
    setResult(res);
    if (!res.error) {
      setName("");
      setEmail("");
      await refresh();
    }
    setSubmitting(false);
  }

  async function changeRole(worker: WorkerProfile, role: WorkerRole) {
    const supabase = createClient();
    await workersApi.updateWorkerRole(supabase, worker.id, { role });
    await refresh();
  }

  if (loading) return <p className="text-sm text-turbo-muted">Yuklanmoqda...</p>;

  if (me?.role !== "admin") {
    return (
      <div className="rounded-2xl border border-turbo-border bg-turbo-surface p-8 text-center text-sm text-turbo-muted">
        Bu bo&apos;lim faqat admin uchun.
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Jamoa
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Xodimlarni boshqarish</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi xodim qo&apos;shish
        </h2>
        <form onSubmit={handleInvite} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Ism</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {submitting ? "Qo'shilmoqda..." : "Xodim qo'shish"}
            </button>
          </div>
        </form>
        {result?.error && <p className="mt-3 text-sm text-turbo-red">{result.error}</p>}
        {result?.tempPassword && (
          <p className="mt-3 text-sm text-turbo-green">
            Xodim qo&apos;shildi. Vaqtinchalik parol: <span className="text-white">{result.tempPassword}</span>{" "}
            — buni xodimga xavfsiz kanal orqali yuboring.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha xodimlar ({workers.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {workers.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-semibold text-white">{w.name}</p>
                <p className="text-xs text-turbo-muted">{w.phone || "—"}</p>
              </div>
              <select
                value={w.role}
                onChange={(e) => changeRole(w, e.target.value as WorkerRole)}
                disabled={w.id === me.id}
                className="rounded-lg border border-turbo-border bg-turbo-black px-3 py-1.5 text-xs text-white focus:border-turbo-red focus:outline-none disabled:opacity-50"
              >
                <option value="worker">Xodim</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
