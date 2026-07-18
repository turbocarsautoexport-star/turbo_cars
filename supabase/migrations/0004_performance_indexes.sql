-- Indexes for the hot query paths. Without these every bid fetch, support
-- message load and access-code redeem does a sequential scan that gets slower
-- as the tables grow.

-- Bids are always read per-auction ordered by created_at (detail page, realtime
-- merge) and the FK has no automatic index in Postgres.
create index if not exists bids_auction_id_created_at_idx
  on public.bids (auction_id, created_at);

-- Auction lists are ordered by created_at and filtered by status.
create index if not exists auctions_created_at_idx
  on public.auctions (created_at desc);
create index if not exists auctions_status_idx
  on public.auctions (status);

-- Support messages are always read per-chat ordered by created_at
-- (panel thread view and the get_support_ticket RPC).
create index if not exists support_messages_chat_id_created_at_idx
  on public.support_messages (chat_id, created_at);

-- Panel ticket list: newest first, grouped by status.
create index if not exists support_chats_status_created_at_idx
  on public.support_chats (status, created_at desc);

-- redeem_access_code RPC and the panel code list both look up by auction.
create index if not exists access_codes_auction_id_code_idx
  on public.access_codes (auction_id, code);
