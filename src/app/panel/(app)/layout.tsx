import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentWorker } from "@/lib/queries/workers";
import Sidebar from "@/components/panel/Sidebar";
import { WorkerProfile } from "@/lib/types";

// Auth-gated, per-request data — never attempt static prerendering.
export const dynamic = "force-dynamic";

// TEMPORARY — remove alongside the debug blocks once diagnosed.
function serializeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ""}`;
  try {
    return JSON.stringify(err, Object.getOwnPropertyNames(err as object), 2);
  } catch {
    return String(err);
  }
}

export default async function PanelAppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-turbo-black px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-white">Ishchilar paneli</h1>
          <p className="mt-2 max-w-sm text-sm text-turbo-muted">
            Backend hali ulanmagan. Supabase loyihasi sozlangach, panel shu yerda ishga tushadi.
          </p>
        </div>
      </div>
    );
  }

  let worker: WorkerProfile | null = null;
  let debugError: string | null = null;
  try {
    const supabase = await createClient();
    worker = await getCurrentWorker(supabase);
  } catch (err) {
    debugError = serializeError(err);
  }

  // TEMPORARY diagnostic — remove once the Vercel deployment issue is found.
  if (debugError) {
    return (
      <div className="min-h-screen bg-turbo-black p-8 text-white">
        <h1 className="font-display text-xl text-turbo-red">Panel layout error (debug)</h1>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-turbo-border bg-turbo-surface p-4 text-xs">
          {debugError}
        </pre>
      </div>
    );
  }

  if (!worker) redirect("/panel/login");

  return (
    <div className="flex min-h-screen bg-turbo-black">
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
    </div>
  );
}
