import type { SupabaseClient } from "@supabase/supabase-js";
import { SupportChat, SupportChatStatus, SupportMessage } from "@/lib/types";

// --- Guest side: everything goes through SECURITY DEFINER RPCs, never direct table access. ---

export async function createSupportTicket(
  supabase: SupabaseClient,
  guestName: string,
  message: string
): Promise<{ chatId: string; ticketCode: string }> {
  const { data, error } = await supabase
    .rpc("create_support_ticket", { p_guest_name: guestName, p_message: message })
    .single();
  if (error) throw error;
  const row = data as { chat_id: string; ticket_code: string };
  return { chatId: row.chat_id, ticketCode: row.ticket_code };
}

export async function getSupportTicket(
  supabase: SupabaseClient,
  ticketCode: string
): Promise<SupportChat | null> {
  const { data, error } = await supabase
    .rpc("get_support_ticket", { p_ticket_code: ticketCode })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as {
    chat_id: string | null;
    status: SupportChatStatus;
    claimed_by_name: string | null;
    created_at: string;
    closed_at: string | null;
    messages: SupportMessage[];
  };
  if (!row.chat_id) return null;
  return {
    id: row.chat_id,
    guestName: "",
    status: row.status,
    claimedByName: row.claimed_by_name,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    messages: row.messages,
  };
}

export async function sendGuestMessage(
  supabase: SupabaseClient,
  ticketCode: string,
  body: string
): Promise<void> {
  const { error } = await supabase.rpc("send_guest_message", {
    p_ticket_code: ticketCode,
    p_body: body,
  });
  if (error) throw error;
}

// --- Staff side: normal table access (RLS-gated to authenticated workers). ---

interface ChatRow {
  id: string;
  ticket_code: string;
  guest_name: string;
  status: SupportChatStatus;
  claimed_by: string | null;
  created_at: string;
  closed_at: string | null;
  satisfaction: number | null;
}

function mapChat(row: ChatRow): SupportChat {
  return {
    id: row.id,
    ticketCode: row.ticket_code,
    guestName: row.guest_name,
    status: row.status,
    claimedBy: row.claimed_by,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    satisfaction: row.satisfaction,
  };
}

/** Channel the guest widget listens on for instant updates to their ticket. */
export function supportTicketChannel(ticketCode: string): string {
  return `support:${ticketCode.toUpperCase()}`;
}

/**
 * Best-effort broadcast poke telling the guest widget to refetch. The guest
 * (anon) has no RLS access to support tables, so postgres_changes can't reach
 * them — broadcast is the only realtime path. Losing a poke is fine: the
 * widget keeps a slow fallback poll.
 */
export async function notifyTicketUpdated(
  supabase: SupabaseClient,
  ticketCode: string
): Promise<void> {
  const channel = supabase.channel(supportTicketChannel(ticketCode));
  try {
    // send() without subscribe() goes over HTTP — no socket kept open.
    await channel.send({ type: "broadcast", event: "update", payload: {} });
  } catch {
    // Fallback poll on the guest side covers a lost poke.
  } finally {
    supabase.removeChannel(channel);
  }
}

export async function getSupportChats(supabase: SupabaseClient): Promise<SupportChat[]> {
  const { data, error } = await supabase
    .from("support_chats")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ChatRow[]).map(mapChat);
}

export async function getSupportMessages(
  supabase: SupabaseClient,
  chatId: string
): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    sender: row.sender,
    body: row.body,
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
  }));
}

export async function claimTicket(
  supabase: SupabaseClient,
  chatId: string,
  workerId: string
): Promise<void> {
  const { error } = await supabase
    .from("support_chats")
    .update({ status: "claimed", claimed_by: workerId })
    .eq("id", chatId);
  if (error) throw error;
}

export async function closeTicket(supabase: SupabaseClient, chatId: string): Promise<void> {
  const { error } = await supabase
    .from("support_chats")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", chatId);
  if (error) throw error;
}

export async function replyToTicket(
  supabase: SupabaseClient,
  chatId: string,
  body: string
): Promise<void> {
  const { error } = await supabase
    .from("support_messages")
    .insert({ chat_id: chatId, sender: "staff", body });
  if (error) throw error;
}
