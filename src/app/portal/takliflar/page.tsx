import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { activeOffers, getOffers } from "@/lib/queries/offers";
import { MOCK_OFFERS } from "@/lib/mockMarketing";
import { Offer } from "@/lib/types";

async function loadOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured) return MOCK_OFFERS;
  const supabase = await createClient();
  return activeOffers(await getOffers(supabase));
}

export default async function PortalOffersPage() {
  const offers = await loadOffers();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Marketing
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Takliflar va sovg&apos;alar</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {offers.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-turbo-border py-12 text-center text-sm text-turbo-muted">
            Hozircha faol takliflar yo&apos;q. Tez orada yangilanadi.
          </p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border border-turbo-border bg-turbo-surface p-6"
            >
              {offer.discountText && (
                <span className="inline-block rounded-full bg-turbo-red/15 px-3 py-1 font-condensed text-xs font-bold uppercase text-turbo-red">
                  {offer.discountText}
                </span>
              )}
              <h2 className="mt-3 font-condensed text-lg font-bold text-white">{offer.title}</h2>
              {offer.description && (
                <p className="mt-2 text-sm text-turbo-muted">{offer.description}</p>
              )}
              {offer.validUntil && (
                <p className="mt-3 text-xs text-turbo-muted">
                  Amal qilish muddati: {new Date(offer.validUntil).toLocaleDateString("uz-UZ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
