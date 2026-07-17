import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getApprovedReviews } from "@/lib/queries/reviews";
import { MOCK_REVIEWS } from "@/lib/mockMarketing";
import { Review } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-turbo-gold">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

async function loadReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return MOCK_REVIEWS;
  const supabase = await createClient();
  return getApprovedReviews(supabase);
}

export default async function PortalReviewsPage() {
  const reviews = await loadReviews();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Fikrlar
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Mijozlar sharhlari</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-turbo-border py-12 text-center text-sm text-turbo-muted">
            Hozircha sharhlar yo&apos;q.
          </p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-turbo-border bg-turbo-surface p-6">
              <Stars rating={r.rating} />
              <p className="mt-3 text-sm leading-relaxed text-turbo-muted">{r.body}</p>
              <p className="mt-4 text-sm font-semibold text-white">{r.customerName}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
