import type { SupabaseClient } from "@supabase/supabase-js";
import { WorkerProfile, WorkerRole } from "@/lib/types";

interface WorkerRow {
  id: string;
  name: string;
  role: WorkerRole;
  permissions: Record<string, boolean>;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
}

function mapWorker(row: WorkerRow): WorkerProfile {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    permissions: row.permissions ?? {},
    phone: row.phone,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

export async function getWorkers(supabase: SupabaseClient): Promise<WorkerProfile[]> {
  const { data, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as WorkerRow[]).map(mapWorker);
}

export async function getCurrentWorker(supabase: SupabaseClient): Promise<WorkerProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapWorker(data as WorkerRow) : null;
}

export async function updateWorkerRole(
  supabase: SupabaseClient,
  workerId: string,
  patch: { role?: WorkerRole; permissions?: Record<string, boolean> }
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.permissions !== undefined) payload.permissions = patch.permissions;
  const { error } = await supabase.from("worker_profiles").update(payload).eq("id", workerId);
  if (error) throw error;
}
