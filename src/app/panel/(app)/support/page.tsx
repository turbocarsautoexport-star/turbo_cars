"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as supportApi from "@/lib/queries/support";
import * as workersApi from "@/lib/queries/workers";
import { SupportChat, SupportMessage, WorkerProfile } from "@/lib/types";

export default function PanelSupportPage() {
  const [me, setMe] = useState<WorkerProfile | null>(null);
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refreshChats() {
    const supabase = createClient();
    setChats(await supportApi.getSupportChats(supabase));
  }

  async function refreshMessages(chatId: string) {
    const supabase = createClient();
    setMessages(await supportApi.getSupportMessages(supabase, chatId));
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [worker] = await Promise.all([workersApi.getCurrentWorker(supabase), refreshChats()]);
      setMe(worker);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedId) {
      (async () => {
        await refreshMessages(selectedId);
      })();
    }
  }, [selectedId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("panel-support")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_chats" }, () => {
        refreshChats();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, (payload) => {
        const row = payload.new as { chat_id: string };
        if (row.chat_id === selectedId) refreshMessages(row.chat_id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sorted = useMemo(() => {
    const order = { open: 0, claimed: 1, closed: 2 };
    return [...chats].sort((a, b) => order[a.status] - order[b.status]);
  }, [chats]);

  const selected = chats.find((c) => c.id === selectedId) ?? null;

  async function claim(chat: SupportChat) {
    if (!me) return;
    const supabase = createClient();
    await supportApi.claimTicket(supabase, chat.id, me.id);
    await refreshChats();
  }

  async function close(chat: SupportChat) {
    const supabase = createClient();
    await supportApi.closeTicket(supabase, chat.id);
    await refreshChats();
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedId) return;
    const supabase = createClient();
    await supportApi.replyToTicket(supabase, selectedId, reply.trim());
    setReply("");
    await refreshMessages(selectedId);
  }

  if (loading) return <p className="text-sm text-turbo-muted">Yuklanmoqda...</p>;

  return (
    <div>
      <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
        Qo&apos;llab-quvvatlash
      </p>
      <h1 className="mt-1 font-display text-3xl text-white">Mijozlar murojaatlari</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-turbo-border bg-turbo-surface lg:col-span-1">
          <div className="divide-y divide-turbo-border">
            {sorted.length === 0 ? (
              <p className="p-6 text-center text-sm text-turbo-muted">Hozircha murojaat yo&apos;q.</p>
            ) : (
              sorted.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedId(chat.id)}
                  className={`block w-full px-4 py-3 text-left transition-colors ${
                    selectedId === chat.id ? "bg-white/5" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-white">{chat.guestName}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        chat.status === "open"
                          ? "bg-turbo-red/15 text-turbo-red"
                          : chat.status === "claimed"
                          ? "bg-turbo-gold/15 text-turbo-gold"
                          : "bg-white/10 text-turbo-muted"
                      }`}
                    >
                      {chat.status === "open" ? "Yangi" : chat.status === "claimed" ? "Jarayonda" : "Yopilgan"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-turbo-muted">
                    {new Date(chat.createdAt).toLocaleString("uz-UZ")}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-turbo-border bg-turbo-surface lg:col-span-2">
          {!selected ? (
            <p className="flex-1 p-8 text-center text-sm text-turbo-muted">
              Murojaatni tanlang.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-turbo-border px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{selected.guestName}</p>
                  <p className="text-xs text-turbo-muted">
                    {selected.status === "open"
                      ? "Hali hech kim javob bermagan"
                      : selected.status === "claimed"
                      ? "Jarayonda"
                      : "Yopilgan"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selected.status !== "closed" && (
                    <>
                      {(selected.status === "open" || selected.claimedBy === me?.id) && (
                        <button
                          onClick={() => claim(selected)}
                          className="rounded-full bg-turbo-gold/15 px-3 py-1.5 text-xs font-bold uppercase text-turbo-gold"
                        >
                          {selected.status === "open" ? "Olish" : "Mening"}
                        </button>
                      )}
                      <button
                        onClick={() => close(selected)}
                        className="rounded-full border border-turbo-border px-3 py-1.5 text-xs text-turbo-muted hover:border-turbo-red hover:text-turbo-red"
                      >
                        Yopish
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: "26rem" }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                      m.sender === "staff" ? "ml-auto bg-turbo-red text-white" : "bg-turbo-black text-white"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendReply} className="flex items-center gap-2 border-t border-turbo-border p-4">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={selected.status === "closed" || (selected.claimedBy != null && selected.claimedBy !== me?.id)}
                  placeholder="Javob yozing..."
                  className="flex-1 rounded-full border border-turbo-border bg-turbo-black px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={selected.status === "closed" || (selected.claimedBy != null && selected.claimedBy !== me?.id)}
                  className="rounded-full bg-turbo-red px-5 py-2.5 font-condensed text-xs font-bold uppercase text-white disabled:opacity-50"
                >
                  Yuborish
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
