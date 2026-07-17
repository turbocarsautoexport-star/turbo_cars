import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSetting } from "@/lib/queries/settings";

async function loadTerms(): Promise<string> {
  if (!isSupabaseConfigured) return "Shartlar va qoidalar matni hali kiritilmagan.";
  const supabase = await createClient();
  return getSetting(supabase, "terms_content");
}

export default async function PortalTermsPage() {
  const content = await loadTerms();

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Hujjat
      </p>
      <h1 className="mt-1 font-display text-2xl text-white sm:text-3xl">Shartlar va qoidalar</h1>

      <div className="mt-8 max-w-3xl rounded-2xl border border-turbo-border bg-turbo-surface p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-turbo-muted">{content}</p>
      </div>
    </div>
  );
}
