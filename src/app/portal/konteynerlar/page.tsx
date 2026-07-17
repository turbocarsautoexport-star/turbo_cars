import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getContainers } from "@/lib/queries/containers";
import { Container } from "@/lib/types";

const STATUS_LABEL: Record<Container["status"], string> = {
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  arrived: "Yetib keldi",
  cleared: "Bojxonadan o'tdi",
};

const STATUS_CLASS: Record<Container["status"], string> = {
  preparing: "border-turbo-border bg-white/5 text-turbo-muted",
  in_transit: "border-turbo-gold/30 bg-turbo-gold/10 text-turbo-gold",
  arrived: "border-turbo-red/30 bg-turbo-red/10 text-turbo-red",
  cleared: "border-turbo-green/30 bg-turbo-green/10 text-turbo-green",
};

async function loadContainers(): Promise<Container[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  return getContainers(supabase);
}

export default async function PortalContainersPage() {
  const containers = await loadContainers();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Logistika
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Konteynerlar holati</h1>
      <p className="mt-2 max-w-xl text-sm text-turbo-muted">
        Yo&apos;lda va yetib kelgan yuklarning umumiy holati.
      </p>

      <div className="mt-8 space-y-3">
        {containers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-turbo-border py-12 text-center text-sm text-turbo-muted">
            Hozircha faol konteynerlar yo&apos;q.
          </p>
        ) : (
          containers.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-turbo-border bg-turbo-surface p-5"
            >
              <div>
                <p className="font-condensed text-base font-bold text-white">
                  {c.containerNumber || "Konteyner"} — {c.originPort} → {c.destinationPort}
                </p>
                <p className="mt-1 text-xs text-turbo-muted">
                  {c.vesselName && `${c.vesselName} · `}
                  {c.arrivalDate
                    ? `Kelish sanasi: ${new Date(c.arrivalDate).toLocaleDateString("uz-UZ")}`
                    : "Kelish sanasi belgilanmagan"}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_CLASS[c.status]}`}
              >
                {STATUS_LABEL[c.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
