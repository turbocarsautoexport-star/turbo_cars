import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSetting } from "@/lib/queries/settings";
import CurrencyConverter from "@/components/portal/CurrencyConverter";

async function loadFxBuffer(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const supabase = await createClient();
  const value = await getSetting(supabase, "fx_buffer");
  return Number(value) || 0;
}

export default async function PortalRatesPage() {
  const fxBuffer = await loadFxBuffer();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Moliya
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Valyuta kursi</h1>
      <p className="mt-2 max-w-xl text-sm text-turbo-muted">
        Jonli USD/KRW kursi — avtomobil xaridi uchun taxminiy hisob-kitob.
      </p>

      <div className="mt-8 max-w-md">
        <CurrencyConverter fxBuffer={fxBuffer} />
      </div>
    </div>
  );
}
