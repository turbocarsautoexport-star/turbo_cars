import type { SupabaseClient } from "@supabase/supabase-js";
import { Offer } from "@/lib/types";

interface OfferRow {
  id: string;
  title: string;
  discount_text: string | null;
  description: string | null;
  publish_date: string;
  valid_until: string | null;
  created_at: string;
}

function mapOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    title: row.title,
    discountText: row.discount_text,
    description: row.description,
    publishDate: row.publish_date,
    validUntil: row.valid_until,
    createdAt: row.created_at,
  };
}

export async function getOffers(supabase: SupabaseClient): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("publish_date", { ascending: false });
  if (error) throw error;
  return (data as OfferRow[]).map(mapOffer);
}

export function activeOffers(offers: Offer[]): Offer[] {
  const today = new Date().toISOString().slice(0, 10);
  return offers.filter((o) => o.publishDate <= today && (!o.validUntil || o.validUntil >= today));
}

export interface NewOfferInput {
  title: string;
  discountText?: string;
  description?: string;
  publishDate: string;
  validUntil?: string;
}

export async function createOffer(supabase: SupabaseClient, input: NewOfferInput): Promise<Offer> {
  const { data, error } = await supabase
    .from("offers")
    .insert({
      title: input.title,
      discount_text: input.discountText || null,
      description: input.description || null,
      publish_date: input.publishDate,
      valid_until: input.validUntil || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapOffer(data as OfferRow);
}

export async function deleteOffer(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw error;
}
