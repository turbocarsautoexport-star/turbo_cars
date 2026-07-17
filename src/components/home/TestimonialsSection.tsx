"use client";

import { useTurboStore } from "@/lib/store";
import { initials } from "@/lib/format";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-turbo-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1}
        >
          <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const testimonials = useTurboStore((s) => s.testimonials);

  return (
    <section id="fikrlar" className="border-t border-turbo-border bg-turbo-black-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
          Fikrlar
        </p>
        <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
          G&apos;oliblarning izohlari
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-2xl border border-turbo-border bg-turbo-surface p-6"
            >
              <Stars rating={t.rating} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-turbo-muted">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-turbo-border pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-turbo-red/15 font-condensed text-sm font-bold text-turbo-red">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-turbo-muted">
                    {t.city} · {t.carWon} yutdi
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
