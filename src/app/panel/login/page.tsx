"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function PanelLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("Email yoki parol noto'g'ri.");
        return;
      }
      router.push("/panel");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-turbo-black px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size={36} />
        </div>
        <h1 className="mt-6 text-center font-display text-2xl text-white">Ishchilar paneli</h1>
        <p className="mt-1 text-center text-sm text-turbo-muted">Xodimlar uchun kirish</p>

        {!isSupabaseConfigured ? (
          <p className="mt-8 rounded-xl border border-turbo-border bg-turbo-surface p-4 text-center text-sm text-turbo-muted">
            Backend hali ulanmagan. Supabase loyihasi sozlangach, bu yerdan kirish mumkin bo&apos;ladi.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-xl border border-turbo-border bg-turbo-surface px-4 py-3 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              required
              className="w-full rounded-xl border border-turbo-border bg-turbo-surface px-4 py-3 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
            />
            {error && <p className="text-sm text-turbo-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-turbo-red px-6 py-3 font-condensed text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
