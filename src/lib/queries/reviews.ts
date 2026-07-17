import type { SupabaseClient } from "@supabase/supabase-js";
import { Review } from "@/lib/types";

interface ReviewRow {
  id: string;
  customer_name: string;
  rating: Review["rating"];
  body: string;
  photo_url: string | null;
  pending: boolean;
  created_at: string;
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    body: row.body,
    photoUrl: row.photo_url,
    pending: row.pending,
    createdAt: row.created_at,
  };
}

/** Public: approved reviews only (RLS also enforces this). */
export async function getApprovedReviews(supabase: SupabaseClient): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("pending", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(mapReview);
}

/** Staff: everything, including the approval queue. */
export async function getAllReviews(supabase: SupabaseClient): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(mapReview);
}

export async function submitReview(
  supabase: SupabaseClient,
  input: { customerName: string; rating: Review["rating"]; body: string; photoUrl?: string }
): Promise<void> {
  const { error } = await supabase.from("reviews").insert({
    customer_name: input.customerName,
    rating: input.rating,
    body: input.body,
    photo_url: input.photoUrl || null,
    pending: true,
  });
  if (error) throw error;
}

export async function approveReview(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("reviews").update({ pending: false }).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
