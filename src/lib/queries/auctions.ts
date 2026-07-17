import type { SupabaseClient } from "@supabase/supabase-js";
import { AccessCode, Auction, Bid } from "@/lib/types";

interface AuctionRow {
  id: string;
  slug: string;
  title: string;
  brand: string;
  year: number;
  mileage_km: number;
  transmission: Auction["transmission"];
  fuel: Auction["fuel"];
  city: string;
  description: string;
  accent: number;
  start_price: number;
  current_price: number;
  bid_step: number;
  currency: "so'm";
  start_at: string;
  end_at: string;
  status: Auction["status"];
  winner_name: string | null;
  reserve_price: number | null;
  requires_deposit: boolean;
  deposit_amount: number;
}

interface BidRow {
  id: string;
  auction_id: string;
  bidder_name: string;
  amount: number;
  created_at: string;
}

function mapBid(row: BidRow): Bid {
  return {
    id: row.id,
    bidderName: row.bidder_name,
    amount: row.amount,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapAuction(row: AuctionRow, bids: Bid[]): Auction {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    year: row.year,
    mileageKm: row.mileage_km,
    transmission: row.transmission,
    fuel: row.fuel,
    city: row.city,
    description: row.description,
    accent: row.accent,
    startPrice: row.start_price,
    currentPrice: row.current_price,
    bidStep: row.bid_step,
    currency: row.currency,
    startAt: new Date(row.start_at).getTime(),
    endAt: new Date(row.end_at).getTime(),
    status: row.status,
    bids,
    winnerName: row.winner_name ?? undefined,
    reservePrice: row.reserve_price ?? undefined,
    requiresDeposit: row.requires_deposit,
    depositAmount: row.deposit_amount,
  };
}

export async function getAuctions(supabase: SupabaseClient): Promise<Auction[]> {
  const [{ data: auctionRows, error: auctionError }, { data: bidRows, error: bidError }] =
    await Promise.all([
      supabase.from("auctions").select("*").order("created_at", { ascending: false }),
      supabase.from("bids").select("*").order("created_at", { ascending: true }),
    ]);
  if (auctionError) throw auctionError;
  if (bidError) throw bidError;

  const bidsByAuction = new Map<string, Bid[]>();
  for (const row of bidRows as BidRow[]) {
    const list = bidsByAuction.get(row.auction_id) ?? [];
    list.push(mapBid(row));
    bidsByAuction.set(row.auction_id, list);
  }

  return (auctionRows as AuctionRow[]).map((row) =>
    mapAuction(row, bidsByAuction.get(row.id) ?? [])
  );
}

export async function getAuctionBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Auction | null> {
  const { data: row, error } = await supabase
    .from("auctions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const { data: bidRows, error: bidError } = await supabase
    .from("bids")
    .select("*")
    .eq("auction_id", row.id)
    .order("created_at", { ascending: true });
  if (bidError) throw bidError;

  return mapAuction(row as AuctionRow, (bidRows as BidRow[]).map(mapBid));
}

/**
 * Inserts a bid. The `auctions.current_price` column is kept in sync by a
 * DB trigger (see supabase/migrations/0001_init.sql) — anon bidders have no
 * direct UPDATE grant on `auctions`, so don't try to update it here.
 */
export async function placeBid(
  supabase: SupabaseClient,
  auctionId: string,
  bidderName: string,
  amount: number
): Promise<void> {
  const { error } = await supabase
    .from("bids")
    .insert({ auction_id: auctionId, bidder_name: bidderName, amount });
  if (error) throw error;
}

export interface NewAuctionInput {
  title: string;
  brand: string;
  year: number;
  mileageKm: number;
  transmission: Auction["transmission"];
  fuel: Auction["fuel"];
  city: string;
  description: string;
  startPrice: number;
  bidStep: number;
  durationMinutes: number;
  startDelayMinutes: number;
}

export async function createAuction(
  supabase: SupabaseClient,
  input: NewAuctionInput
): Promise<Auction> {
  const now = Date.now();
  const startAt = now + input.startDelayMinutes * 60_000;
  const endAt = startAt + input.durationMinutes * 60_000;
  const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${now}`;

  const { data, error } = await supabase
    .from("auctions")
    .insert({
      slug,
      title: input.title,
      brand: input.brand,
      year: input.year,
      mileage_km: input.mileageKm,
      transmission: input.transmission,
      fuel: input.fuel,
      city: input.city,
      description: input.description,
      accent: Math.floor(Math.random() * 5),
      start_price: input.startPrice,
      current_price: input.startPrice,
      bid_step: input.bidStep,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      status: input.startDelayMinutes <= 0 ? "live" : "upcoming",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapAuction(data as AuctionRow, []);
}

export async function startAuction(supabase: SupabaseClient, auctionId: string): Promise<void> {
  const { error } = await supabase
    .from("auctions")
    .update({ status: "live", start_at: new Date().toISOString() })
    .eq("id", auctionId);
  if (error) throw error;
}

export async function closeAuction(
  supabase: SupabaseClient,
  auctionId: string,
  winnerName?: string
): Promise<void> {
  const { error } = await supabase
    .from("auctions")
    .update({ status: "ended", end_at: new Date().toISOString(), winner_name: winnerName ?? null })
    .eq("id", auctionId);
  if (error) throw error;
}

export async function setAuctionTimerMinutes(
  supabase: SupabaseClient,
  auctionId: string,
  minutes: number
): Promise<void> {
  const { error } = await supabase
    .from("auctions")
    .update({ end_at: new Date(Date.now() + minutes * 60_000).toISOString() })
    .eq("id", auctionId);
  if (error) throw error;
}

export async function setAuctionDeposit(
  supabase: SupabaseClient,
  auctionId: string,
  requiresDeposit: boolean,
  depositAmount: number
): Promise<void> {
  const { error } = await supabase
    .from("auctions")
    .update({ requires_deposit: requiresDeposit, deposit_amount: depositAmount })
    .eq("id", auctionId);
  if (error) throw error;
}

function generateCodeString(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function generateAccessCode(
  supabase: SupabaseClient,
  auctionId: string,
  holderName?: string
): Promise<AccessCode> {
  const code = generateCodeString();
  const { data, error } = await supabase
    .from("access_codes")
    .insert({ auction_id: auctionId, code, holder_name: holderName || null })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    auctionId: data.auction_id,
    code: data.code,
    holderName: data.holder_name ?? undefined,
    createdAt: new Date(data.created_at).getTime(),
    redeemedAt: data.redeemed_at ? new Date(data.redeemed_at).getTime() : undefined,
  };
}

export async function getAccessCodes(
  supabase: SupabaseClient,
  auctionId: string
): Promise<AccessCode[]> {
  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .eq("auction_id", auctionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    auctionId: row.auction_id,
    code: row.code,
    holderName: row.holder_name ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
    redeemedAt: row.redeemed_at ? new Date(row.redeemed_at).getTime() : undefined,
  }));
}

export type RedeemResult = "ok" | "invalid" | "used";

export async function redeemAccessCode(
  supabase: SupabaseClient,
  auctionId: string,
  code: string
): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc("redeem_access_code", {
    p_auction_id: auctionId,
    p_code: code,
  });
  if (error) throw error;
  return data as RedeemResult;
}
