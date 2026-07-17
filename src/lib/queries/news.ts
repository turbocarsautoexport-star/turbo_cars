import type { SupabaseClient } from "@supabase/supabase-js";
import { NewsItem } from "@/lib/types";

interface NewsRow {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

function mapNews(row: NewsRow): NewsItem {
  return { id: row.id, title: row.title, body: row.body, createdAt: row.created_at };
}

export async function getNews(supabase: SupabaseClient): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as NewsRow[]).map(mapNews);
}

export async function createNews(
  supabase: SupabaseClient,
  input: { title: string; body: string }
): Promise<void> {
  const { error } = await supabase.from("news").insert(input);
  if (error) throw error;
}

export async function deleteNews(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}
