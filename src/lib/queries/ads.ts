import type { SupabaseClient } from "@supabase/supabase-js";
import { Ad, AdAccent, AdMedia, AdPlacement, AdSection, AdSize } from "@/lib/types";

interface AdRow {
  id: string;
  section: AdSection;
  placement: AdPlacement;
  size: AdSize | null;
  accent: AdAccent;
  body: string;
  cta_label: string | null;
  start_date: string | null;
  end_date: string | null;
  media: AdMedia[];
  clicks: number;
  created_at: string;
}

function mapAd(row: AdRow): Ad {
  return {
    id: row.id,
    section: row.section,
    placement: row.placement,
    size: row.size,
    accent: row.accent,
    body: row.body,
    ctaLabel: row.cta_label,
    startDate: row.start_date,
    endDate: row.end_date,
    media: row.media ?? [],
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

export async function getAds(supabase: SupabaseClient): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AdRow[]).map(mapAd);
}

/** Ads active today for a given section, grouped by placement. */
export function activeAdsForSection(ads: Ad[], section: AdSection): Ad[] {
  const today = new Date().toISOString().slice(0, 10);
  return ads.filter((ad) => {
    if (ad.section !== section) return false;
    if (ad.startDate && ad.startDate > today) return false;
    if (ad.endDate && ad.endDate < today) return false;
    return true;
  });
}

/** Deterministic daily rotation when multiple ads match the same section+placement. */
export function pickRotatingAd(ads: Ad[], placement: AdPlacement): Ad | null {
  const matches = ads.filter((a) => a.placement === placement);
  if (matches.length === 0) return null;
  const dayIndex = Math.floor(Date.now() / 86_400_000) % matches.length;
  return matches[dayIndex];
}

export interface NewAdInput {
  section: AdSection;
  placement: AdPlacement;
  size?: AdSize;
  accent: AdAccent;
  body: string;
  ctaLabel?: string;
  startDate?: string;
  endDate?: string;
  media: AdMedia[];
}

export async function createAd(supabase: SupabaseClient, input: NewAdInput): Promise<Ad> {
  const { data, error } = await supabase
    .from("ads")
    .insert({
      section: input.section,
      placement: input.placement,
      size: input.size || null,
      accent: input.accent,
      body: input.body,
      cta_label: input.ctaLabel || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      media: input.media,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapAd(data as AdRow);
}

export async function updateAd(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<NewAdInput>
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.section !== undefined) payload.section = patch.section;
  if (patch.placement !== undefined) payload.placement = patch.placement;
  if (patch.size !== undefined) payload.size = patch.size || null;
  if (patch.accent !== undefined) payload.accent = patch.accent;
  if (patch.body !== undefined) payload.body = patch.body;
  if (patch.ctaLabel !== undefined) payload.cta_label = patch.ctaLabel || null;
  if (patch.startDate !== undefined) payload.start_date = patch.startDate || null;
  if (patch.endDate !== undefined) payload.end_date = patch.endDate || null;
  if (patch.media !== undefined) payload.media = patch.media;

  const { error } = await supabase.from("ads").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteAd(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("ads").delete().eq("id", id);
  if (error) throw error;
}

export async function trackAdClick(supabase: SupabaseClient, id: string, currentClicks: number) {
  await supabase.from("ads").update({ clicks: currentClicks + 1 }).eq("id", id);
}
