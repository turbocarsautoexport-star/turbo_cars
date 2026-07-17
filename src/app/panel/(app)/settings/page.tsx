"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as settingsApi from "@/lib/queries/settings";

export default function PanelSettingsPage() {
  const [terms, setTerms] = useState("");
  const [fxBuffer, setFxBuffer] = useState("0");
  const [loading, setLoading] = useState(true);
  const [savedField, setSavedField] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const values = await settingsApi.getSettings(supabase, ["terms_content", "fx_buffer"]);
      setTerms(values.terms_content ?? "");
      setFxBuffer(values.fx_buffer ?? "0");
      setLoading(false);
    })();
  }, []);

  async function saveTerms(e: FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await settingsApi.updateSetting(supabase, "terms_content", terms);
    setSavedField("terms");
    setTimeout(() => setSavedField(null), 2000);
  }

  async function saveFxBuffer(e: FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await settingsApi.updateSetting(supabase, "fx_buffer", fxBuffer);
    setSavedField("fx");
    setTimeout(() => setSavedField(null), 2000);
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  if (loading) return <p className="text-sm text-turbo-muted">Yuklanmoqda...</p>;

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Sozlamalar
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Sayt sozlamalari</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Shartlar va qoidalar
        </h2>
        <form onSubmit={saveTerms} className="mt-4 space-y-4">
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={10}
            className={inputCls}
          />
          <button
            type="submit"
            className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white"
          >
            Saqlash
          </button>
          {savedField === "terms" && <span className="ml-4 text-sm text-turbo-green">Saqlandi ✓</span>}
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Valyuta kursi bufer
        </h2>
        <p className="mt-1 mb-4 text-sm text-turbo-muted">
          Jonli USD/KRW kursidan ayiriladigan summa — mijozlarga ko&apos;rsatiladigan &quot;TURBO
          kursi&quot;ni belgilaydi.
        </p>
        <form onSubmit={saveFxBuffer} className="flex items-end gap-3">
          <div>
            <label className={labelCls}>Bufer (KRW)</label>
            <input
              value={fxBuffer}
              onChange={(e) => setFxBuffer(e.target.value.replace(/[^0-9.]/g, ""))}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white"
          >
            Saqlash
          </button>
          {savedField === "fx" && <span className="text-sm text-turbo-green">Saqlandi ✓</span>}
        </form>
      </div>
    </div>
  );
}
