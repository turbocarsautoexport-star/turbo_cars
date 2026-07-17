import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCurrentWorker } from "@/lib/queries/workers";
import Sidebar from "@/components/panel/Sidebar";

// Auth-gated, per-request data — never attempt static prerendering.
export const dynamic = "force-dynamic";

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

  const supabase = await createClient();
  const worker = await getCurrentWorker(supabase);
  if (!worker) redirect("/panel/login");

  return (
    <div className="flex min-h-screen bg-turbo-black">
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
    </div>
  );
}
