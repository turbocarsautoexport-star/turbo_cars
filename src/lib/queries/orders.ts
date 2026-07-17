import type { SupabaseClient } from "@supabase/supabase-js";
import { Order, OrderLookup } from "@/lib/types";

interface OrderRow {
  id: string;
  tracking_code: string;
  guest_name: string;
  car_id: string | null;
  container_id: string | null;
  status_note: string;
  created_at: string;
  updated_at: string;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    guestName: row.guest_name,
    carId: row.car_id,
    containerId: row.container_id,
    statusNote: row.status_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Staff side ---

export async function getOrders(supabase: SupabaseClient): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(mapOrder);
}

function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "T";
  for (let i = 0; i < 7; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export interface NewOrderInput {
  guestName: string;
  carId?: string;
  containerId?: string;
  statusNote?: string;
}

export async function createOrder(supabase: SupabaseClient, input: NewOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      tracking_code: generateTrackingCode(),
      guest_name: input.guestName,
      car_id: input.carId || null,
      container_id: input.containerId || null,
      status_note: input.statusNote || "",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapOrder(data as OrderRow);
}

export async function updateOrder(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<NewOrderInput>
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.guestName !== undefined) payload.guest_name = patch.guestName;
  if (patch.carId !== undefined) payload.car_id = patch.carId || null;
  if (patch.containerId !== undefined) payload.container_id = patch.containerId || null;
  if (patch.statusNote !== undefined) payload.status_note = patch.statusNote;

  const { error } = await supabase.from("orders").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

// --- Guest side: RPC only ---

export async function trackOrder(
  supabase: SupabaseClient,
  trackingCode: string
): Promise<OrderLookup | null> {
  const { data, error } = await supabase
    .rpc("track_order", { p_tracking_code: trackingCode })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as {
    guest_name: string;
    status_note: string;
    updated_at: string;
    car_model: string | null;
    car_year: number | null;
    car_status: string | null;
    container_status: string | null;
    container_origin_port: string | null;
    container_destination_port: string | null;
    container_departure_date: string | null;
    container_arrival_date: string | null;
    container_vessel_name: string | null;
  };
  return {
    guestName: row.guest_name,
    statusNote: row.status_note,
    updatedAt: row.updated_at,
    carModel: row.car_model,
    carYear: row.car_year,
    carStatus: row.car_status,
    containerStatus: row.container_status,
    containerOriginPort: row.container_origin_port,
    containerDestinationPort: row.container_destination_port,
    containerDepartureDate: row.container_departure_date,
    containerArrivalDate: row.container_arrival_date,
    containerVesselName: row.container_vessel_name,
  };
}
