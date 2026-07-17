"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import * as supportApi from "@/lib/queries/support";
import { SupportChat } from "@/lib/types";

const STORAGE_KEY = "turbo-support-ticket-code";
const POLL_MS = 4000;

export default function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Read lazily (not in an effect): `open` starts false so the panel that
  // depends on this is never part of the first paint, avoiding any SSR mismatch.
  const [ticketCode, setTicketCode] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY)
  );
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ticketCode || !isSupabaseConfigured) return;

    let cancelled = false;
    async function poll() {
      try {
        const supabase = createClient();
        const result = await supportApi.getSupportTicket(supabase, ticketCode!);
        if (!cancelled) setChat(result);
      } catch {
        // transient network errors are fine to ignore on a poll loop
      }
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [open, ticketCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  async function startTicket(e: FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { ticketCode: code } = await supportApi.createSupportTicket(
        supabase,
        guestName.trim(),
        message.trim()
      );
      localStorage.setItem(STORAGE_KEY, code);
      setTicketCode(code);
      setMessage("");
    } catch {
      setError("Xabarni yuborib bo'lmadi. Birozdan so'ng qaytadan urinib ko'ring.");
    } finally {
      setSending(false);
    }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || !ticketCode) return;
    setSending(true);
    setError(null);
    try {
      const supabase = createClient();
      await supportApi.sendGuestMessage(supabase, ticketCode, message.trim());
      setMessage("");
      const result = await supportApi.getSupportTicket(supabase, ticketCode);
      setChat(result);
    } catch {
      setError("Xabar yuborilmadi. Qaytadan urinib ko'ring.");
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    localStorage.removeItem(STORAGE_KEY);
    setTicketCode(null);
    setChat(null);
  }

  if (pathname?.startsWith("/panel")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-turbo-border bg-turbo-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-turbo-border px-4 py-3">
            <p className="font-condensed text-sm font-bold uppercase tracking-wide text-white">
              Qo&apos;llab-quvvatlash
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-turbo-muted hover:text-white"
              aria-label="Yopish"
            >
              ✕
            </button>
          </div>

          {!isSupabaseConfigured ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-sm text-turbo-muted">
              <p>Onlayn chat hozircha ulanmagan.</p>
              <p className="mt-1">Iltimos, bizga Telegram orqali murojaat qiling.</p>
            </div>
          ) : !ticketCode ? (
            <form onSubmit={startTicket} className="flex flex-1 flex-col gap-3 p-4">
              <p className="text-xs text-turbo-muted">
                Savolingizni yozing — jamoamiz tez orada javob beradi.
              </p>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ismingiz"
                required
                className="rounded-xl border border-turbo-border bg-turbo-black px-3 py-2 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Savolingiz..."
                required
                rows={4}
                className="flex-1 resize-none rounded-xl border border-turbo-border bg-turbo-black px-3 py-2 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none"
              />
              {error && <p className="text-xs text-turbo-red">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-turbo-red px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
              >
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {chat?.status === "closed" && (
                  <p className="rounded-lg bg-white/5 px-3 py-2 text-center text-xs text-turbo-muted">
                    Ushbu murojaat yopilgan.
                  </p>
                )}
                {chat?.claimedByName && chat.status !== "closed" && (
                  <p className="text-center text-[11px] uppercase tracking-wide text-turbo-muted">
                    {chat.claimedByName} javob bermoqda
                  </p>
                )}
                {(chat?.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.sender === "guest"
                        ? "ml-auto bg-turbo-red text-white"
                        : "bg-turbo-black text-white"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendReply} className="flex items-center gap-2 border-t border-turbo-border p-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={chat?.status === "closed" ? "Murojaat yopilgan" : "Xabar yozing..."}
                  disabled={chat?.status === "closed"}
                  className="flex-1 rounded-full border border-turbo-border bg-turbo-black px-3 py-2 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || chat?.status === "closed"}
                  className="rounded-full bg-turbo-red px-4 py-2 font-condensed text-xs font-bold uppercase text-white disabled:opacity-50"
                >
                  Yuborish
                </button>
              </form>
              {error && <p className="px-4 pb-2 text-xs text-turbo-red">{error}</p>}
              <button
                onClick={startOver}
                className="border-t border-turbo-border px-4 py-2 text-left text-[11px] text-turbo-muted hover:text-white"
              >
                Yangi murojaat boshlash
              </button>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-turbo-red text-2xl text-white shadow-[0_10px_30px_-10px_rgba(246,6,10,0.7)] transition-transform hover:scale-105"
        aria-label="Qo'llab-quvvatlash chatini ochish"
      >
        💬
      </button>
    </div>
  );
}
