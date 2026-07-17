import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getNews } from "@/lib/queries/news";
import { NewsItem } from "@/lib/types";

async function loadNews(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  return getNews(supabase);
}

export default async function PortalNewsPage() {
  const news = await loadNews();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Kompaniya
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Yangiliklar</h1>

      <div className="mt-8 space-y-4">
        {news.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-turbo-border py-12 text-center text-sm text-turbo-muted">
            Hozircha yangiliklar yo&apos;q. Tez orada qo&apos;shiladi.
          </p>
        ) : (
          news.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-turbo-border bg-turbo-surface p-6"
            >
              <p className="text-xs text-turbo-muted">
                {new Date(item.createdAt).toLocaleDateString("uz-UZ")}
              </p>
              <h2 className="mt-1 font-condensed text-lg font-bold text-white">{item.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-turbo-muted">
                {item.body}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
