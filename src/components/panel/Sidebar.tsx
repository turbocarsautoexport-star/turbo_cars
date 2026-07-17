"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { WorkerProfile } from "@/lib/types";

const NAV = [
  { href: "/panel", label: "Bosh sahifa", icon: "📊", exact: true },
  { href: "/panel/cars", label: "Avtomobillar", icon: "🚘" },
  { href: "/panel/auctions", label: "Auksionlar", icon: "🔨" },
  { href: "/panel/containers", label: "Konteynerlar", icon: "🚢" },
  { href: "/panel/orders", label: "Buyurtmalar", icon: "🔎" },
  { href: "/panel/news", label: "Yangiliklar", icon: "📰" },
  { href: "/panel/ads", label: "Reklama", icon: "📣" },
  { href: "/panel/reviews", label: "Sharhlar", icon: "⭐" },
  { href: "/panel/support", label: "Qo'llab-quvvatlash", icon: "💬" },
  { href: "/panel/team", label: "Jamoa", icon: "👥", adminOnly: true },
  { href: "/panel/settings", label: "Sozlamalar", icon: "⚙️", adminOnly: true },
];

export default function Sidebar({ worker }: { worker: WorkerProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/panel/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-turbo-border bg-turbo-surface">
      <div className="border-b border-turbo-border px-5 py-5">
        <Link href="/panel">
          <Logo size={26} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.filter((item) => !item.adminOnly || worker.role === "admin").map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-condensed text-sm font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? "bg-turbo-red text-white"
                  : "text-turbo-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-turbo-border p-4">
        <p className="truncate text-sm font-semibold text-white">{worker.name}</p>
        <p className="text-xs text-turbo-muted">{worker.role === "admin" ? "Admin" : "Xodim"}</p>
        <button
          onClick={handleSignOut}
          className="mt-3 w-full rounded-full border border-turbo-border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
        >
          Chiqish
        </button>
      </div>
    </aside>
  );
}
