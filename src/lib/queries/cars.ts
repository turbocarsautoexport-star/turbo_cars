import type { SupabaseClient } from "@supabase/supabase-js";
import { Car, CarStatus } from "@/lib/types";

interface CarRow {
  id: string;
  model: string;
  year: number;
  photos: string[];
  status: CarStatus;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapCar(row: CarRow): Car {
  return {
    id: row.id,
    model: row.model,
    year: row.year,
    photos: row.photos ?? [],
    status: row.status,
    category: row.category,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCars(supabase: SupabaseClient): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CarRow[]).map(mapCar);
}

export interface NewCarInput {
  model: string;
  year: number;
  photos: string[];
  status: CarStatus;
  category?: string;
  notes?: string;
}

export async function createCar(supabase: SupabaseClient, input: NewCarInput): Promise<Car> {
  const { data, error } = await supabase
    .from("cars")
    .insert({
      model: input.model,
      year: input.year,
      photos: input.photos,
      status: input.status,
      category: input.category || null,
      notes: input.notes || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCar(data as CarRow);
}

export async function updateCar(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<NewCarInput>
): Promise<void> {
  const { error } = await supabase
    .from("cars")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCar(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) throw error;
}
