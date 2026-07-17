import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSetting(supabase: SupabaseClient, key: string): Promise<string> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? "";
}

export async function getSettings(
  supabase: SupabaseClient,
  keys: string[]
): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value").in("key", keys);
  if (error) throw error;
  const result: Record<string, string> = {};
  for (const row of data as { key: string; value: string }[]) result[row.key] = row.value;
  return result;
}

export async function updateSetting(
  supabase: SupabaseClient,
  key: string,
  value: string
): Promise<void> {
  const { error } = await supabase.from("site_settings").upsert({ key, value });
  if (error) throw error;
}
