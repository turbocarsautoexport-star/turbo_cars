"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as reviewsApi from "@/lib/queries/reviews";
import { Review } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-turbo-gold">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
  );
}

export default function PanelReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const supabase = createClient();
    setReviews(await reviewsApi.getAllReviews(supabase));
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function approve(review: Review) {
    const supabase = createClient();
    await reviewsApi.approveReview(supabase, review.id);
    await refresh();
  }

  async function remove(review: Review) {
    if (!confirm("Bu sharh o'chirilsinmi?")) return;
    const supabase = createClient();
    await reviewsApi.deleteReview(supabase, review.id);
    await refresh();
  }

  const pending = reviews.filter((r) => r.pending);
  const approved = reviews.filter((r) => !r.pending);

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Sharhlar
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Mijozlar sharhlari</h1>

      {loading ? (
        <p className="mt-8 text-sm text-turbo-muted">Yuklanmoqda...</p>
      ) : (
        <>
          <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              Tasdiqlash kutilmoqda ({pending.length})
            </h2>
            <div className="mt-4 divide-y divide-turbo-border">
              {pending.length === 0 ? (
                <p className="py-6 text-center text-sm text-turbo-muted">Hozircha yo&apos;q.</p>
              ) : (
                pending.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {r.customerName} <Stars rating={r.rating} />
                      </p>
                      <p className="mt-1 text-sm text-turbo-muted">{r.body}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => approve(r)}
                        className="rounded-full bg-turbo-green/15 px-3 py-1.5 text-xs font-bold uppercase text-turbo-green"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => remove(r)}
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

          <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
              E&apos;lon qilingan ({approved.length})
            </h2>
            <div className="mt-4 divide-y divide-turbo-border">
              {approved.length === 0 ? (
                <p className="py-6 text-center text-sm text-turbo-muted">Hozircha yo&apos;q.</p>
              ) : (
                approved.map((r) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {r.customerName} <Stars rating={r.rating} />
                      </p>
                      <p className="mt-1 text-sm text-turbo-muted">{r.body}</p>
                    </div>
                    <button
                      onClick={() => remove(r)}
                      className="shrink-0 rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                    >
                      O&apos;chirish
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
