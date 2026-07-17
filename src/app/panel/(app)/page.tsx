import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAuctions } from "@/lib/queries/auctions";
import { getCars } from "@/lib/queries/cars";
import { getSupportChats } from "@/lib/queries/support";

// TEMPORARY — remove alongside the debug block once diagnosed.
function serializeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ""}`;
  try {
    return JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2);
  } catch {
    return String(err);
  }
}

export default async function PanelDashboardPage() {
  // The parent layout renders a "not connected" screen instead of {children}
  // when Supabase isn't configured, but Next still evaluates this page's
  // server component either way — guard here too so it doesn't throw.
  if (!isSupabaseConfigured) return null;

  let auctions: Awaited<ReturnType<typeof getAuctions>> = [];
  let cars: Awaited<ReturnType<typeof getCars>> = [];
  let tickets: Awaited<ReturnType<typeof getSupportChats>> = [];
  let debugError: string | null = null;

  try {
    const supabase = await createClient();
    [auctions, cars, tickets] = await Promise.all([
      getAuctions(supabase),
      getCars(supabase),
      getSupportChats(supabase),
    ]);
  } catch (err) {
    debugError = serializeError(err);
  }

  // TEMPORARY diagnostic — remove once the Vercel deployment issue is found.
  if (debugError) {
    return (
      <div>
        <h1 className="font-display text-xl text-turbo-red">Dashboard error (debug)</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-turbo-border bg-turbo-surface p-4 text-xs text-white">
          {debugError}
        </pre>
      </div>
    );
  }

  const stats = [
    { label: "Jonli auksionlar", value: auctions.filter((a) => a.status === "live").length },
    { label: "Tez orada", value: auctions.filter((a) => a.status === "upcoming").length },
    { label: "Sotuvdagi avtomobillar", value: cars.filter((c) => c.status !== "sold").length },
    { label: "Ochiq murojaatlar", value: tickets.filter((t) => t.status !== "closed").length },
  ];

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Bosh sahifa
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Umumiy ko&apos;rinish</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-turbo-border bg-turbo-surface p-5 text-center"
          >
            <p className="font-display text-3xl text-turbo-red">{s.value}</p>
            <p className="mt-1 text-xs text-turbo-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
