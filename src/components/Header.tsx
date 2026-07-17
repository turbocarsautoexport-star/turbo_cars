"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const NAV = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/eksport", label: "Eksport" },
  { href: "/auksionlar", label: "Auksionlar" },
  { href: "/#kontakt", label: "Kontakt" },
  { href: "/panel", label: "Ishchilar paneli" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-turbo-border/80 bg-turbo-black/85 backdrop-blur supports-[backdrop-filter]:bg-turbo-black/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo size={30} />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href.startsWith("/#")
                ? false
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-condensed text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? "text-turbo-red"
                    : "text-turbo-muted hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/auksionlar"
            className="rounded-full bg-turbo-red px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-turbo-red-dark"
          >
            Jonli savdolar
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-turbo-border text-white md:hidden"
          aria-label="Menyu"
        >
          <span className="sr-only">Menyu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-turbo-border bg-turbo-black px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-condensed text-base font-semibold uppercase tracking-wide text-turbo-muted hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/auksionlar"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-turbo-red px-5 py-2 text-center font-condensed text-sm font-bold uppercase tracking-wide text-white"
            >
              Jonli savdolar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
