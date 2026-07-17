"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/portal", label: "Yangiliklar", icon: "📰", exact: true },
  { href: "/portal/takliflar", label: "Takliflar", icon: "🎁" },
  { href: "/portal/valyuta", label: "Valyuta kursi", icon: "💱" },
  { href: "/portal/konteynerlar", label: "Konteynerlar", icon: "🚢" },
  { href: "/portal/buyurtma", label: "Buyurtmani kuzatish", icon: "🔎" },
  { href: "/portal/sharhlar", label: "Sharhlar", icon: "⭐" },
  { href: "/portal/shartlar", label: "Shartlar", icon: "📄" },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-turbo-border bg-turbo-surface">
      <div className="border-b border-turbo-border px-5 py-5">
        <Link href="/">
          <Logo size={26} />
        </Link>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-turbo-muted">
          Mijozlar portali
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
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
        <Link
          href="/"
          className="block w-full rounded-full border border-turbo-border px-4 py-2 text-center font-condensed text-xs font-bold uppercase tracking-wide text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
        >
          ← Bosh sahifaga qaytish
        </Link>
      </div>
    </aside>
  );
}
