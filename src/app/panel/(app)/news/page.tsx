"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as newsApi from "@/lib/queries/news";
import { NewsItem } from "@/lib/types";

export default function PanelNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const supabase = createClient();
    setNews(await newsApi.getNews(supabase));
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
      await newsApi.createNews(supabase, { title: title.trim(), body: body.trim() });
      setTitle("");
      setBody("");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: NewsItem) {
    if (!confirm("Bu yangilik o'chirilsinmi?")) return;
    const supabase = createClient();
    await newsApi.deleteNews(supabase, item.id);
    await refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-turbo-muted";

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Kompaniya
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Yangiliklar</h1>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Yangi e&apos;lon
        </h2>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Sarlavha</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Matn</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className={inputCls} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
          >
            {submitting ? "Joylanmoqda..." : "Joylash"}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-wider text-white">
          Barcha yangiliklar ({news.length})
        </h2>
        <div className="mt-4 divide-y divide-turbo-border">
          {loading ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Yuklanmoqda...</p>
          ) : news.length === 0 ? (
            <p className="py-8 text-center text-sm text-turbo-muted">Hali yangilik qo&apos;shilmagan.</p>
          ) : (
            news.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-turbo-muted">{item.body}</p>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  className="shrink-0 rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                >
                  O&apos;chirish
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
