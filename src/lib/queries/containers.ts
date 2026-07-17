import type { SupabaseClient } from "@supabase/supabase-js";
import { Container, ContainerCustomsStatus, ContainerStatus } from "@/lib/types";

interface ContainerRow {
  id: string;
  container_number: string | null;
  origin_port: string;
  destination_port: string;
  departure_date: string | null;
  arrival_date: string | null;
  vessel_name: string | null;
  voyage_number: string | null;
  customs_status: ContainerCustomsStatus;
  status: ContainerStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapContainer(row: ContainerRow): Container {
  return {
    id: row.id,
    containerNumber: row.container_number,
    originPort: row.origin_port,
    destinationPort: row.destination_port,
    departureDate: row.departure_date,
    arrivalDate: row.arrival_date,
    vesselName: row.vessel_name,
    voyageNumber: row.voyage_number,
    customsStatus: row.customs_status,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getContainers(supabase: SupabaseClient): Promise<Container[]> {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContainerRow[]).map(mapContainer);
}

export interface NewContainerInput {
  containerNumber?: string;
  originPort: string;
  destinationPort: string;
  departureDate?: string;
  arrivalDate?: string;
  vesselName?: string;
  voyageNumber?: string;
  customsStatus: ContainerCustomsStatus;
  status: ContainerStatus;
  notes?: string;
}

export async function createContainer(
  supabase: SupabaseClient,
  input: NewContainerInput
): Promise<void> {
  const { error } = await supabase.from("containers").insert({
    container_number: input.containerNumber || null,
    origin_port: input.originPort,
    destination_port: input.destinationPort,
    departure_date: input.departureDate || null,
    arrival_date: input.arrivalDate || null,
    vessel_name: input.vesselName || null,
    voyage_number: input.voyageNumber || null,
    customs_status: input.customsStatus,
    status: input.status,
    notes: input.notes || null,
  });
  if (error) throw error;
}

export async function updateContainer(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<NewContainerInput>
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.containerNumber !== undefined) payload.container_number = patch.containerNumber || null;
  if (patch.originPort !== undefined) payload.origin_port = patch.originPort;
  if (patch.destinationPort !== undefined) payload.destination_port = patch.destinationPort;
  if (patch.departureDate !== undefined) payload.departure_date = patch.departureDate || null;
  if (patch.arrivalDate !== undefined) payload.arrival_date = patch.arrivalDate || null;
  if (patch.vesselName !== undefined) payload.vessel_name = patch.vesselName || null;
  if (patch.voyageNumber !== undefined) payload.voyage_number = patch.voyageNumber || null;
  if (patch.customsStatus !== undefined) payload.customs_status = patch.customsStatus;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.notes !== undefined) payload.notes = patch.notes || null;

  const { error } = await supabase.from("containers").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteContainer(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("containers").delete().eq("id", id);
  if (error) throw error;
}
