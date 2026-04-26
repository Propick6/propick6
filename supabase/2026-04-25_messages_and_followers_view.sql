-- =========================================================================
-- Pro Pick 6 — Messages module + widen follows visibility (2026-04-25)
-- =========================================================================
-- Adds:
--   1) Messages module: conversations + conversation_members + messages,
--      a SECURITY DEFINER membership helper to keep RLS policies recursion-safe,
--      a find_or_create_dm RPC for "click Message → reach the other person",
--      a trigger to bump conversations.last_message_at on every new message,
--      and Realtime publication on messages so threads update live.
--
--   2) Loosens public.follows SELECT policy so a user can ALSO see rows
--      where they are the followed_id (i.e. who follows ME). Privacy model
--      stays the same — third parties still can't enumerate someone else's
--      followers; only the count (profiles.follower_count) is public.
-- =========================================================================

-- ---------- 1. Allow users to see who follows them ----------
drop policy if exists "follows_select_own" on public.follows;
create policy "follows_select_own"
  on public.follows for select
  using (auth.uid() = follower_id or auth.uid() = followed_id);

-- ---------- 2. Conversations + members + messages tables ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false, -- false = 1-on-1 DM (this round); true reserved for future group chats
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_last_message_idx
  on public.conversations (last_message_at desc);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conv_members_user_idx
  on public.conversation_members (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_created_idx
  on public.messages (conversation_id, created_at);

-- ---------- 3. Membership helper (SECURITY DEFINER → no RLS recursion) ----------
create or replace function public.is_conv_member(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_conv_member(uuid) from public;
grant execute on function public.is_conv_member(uuid) to authenticated;

-- ---------- 4. RLS ----------
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Conversations: visible only to members.
drop policy if exists "convos_select_member" on public.conversations;
create policy "convos_select_member"
  on public.conversations for select
  using (public.is_conv_member(id));

-- Conversation_members: members can see all member rows in their conversations
-- so the UI can render the OTHER person's handle/avatar.
drop policy if exists "members_select_in_my_convos" on public.conversation_members;
create policy "members_select_in_my_convos"
  on public.conversation_members for select
  using (public.is_conv_member(conversation_id));

-- Members can update their OWN row (e.g. last_read_at) — for unread tracking.
drop policy if exists "members_update_own_row" on public.conversation_members;
create policy "members_update_own_row"
  on public.conversation_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Messages: read all in your convos; insert only as yourself in your convos.
drop policy if exists "msgs_select_in_my_convos" on public.messages;
create policy "msgs_select_in_my_convos"
  on public.messages for select
  using (public.is_conv_member(conversation_id));

drop policy if exists "msgs_insert_own_in_my_convos" on public.messages;
create policy "msgs_insert_own_in_my_convos"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_conv_member(conversation_id)
  );

-- ---------- 5. find_or_create_dm RPC ----------
-- Idempotent: returns the existing 1-on-1 conversation between auth.uid()
-- and the target user, or creates a new one if none exists. Returns null
-- when called signed-out or with self.
create or replace function public.find_or_create_dm(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv_id uuid;
begin
  if me is null or other_user_id is null then return null; end if;
  if me = other_user_id then return null; end if;

  -- Find an existing 1-on-1 between exactly these two users.
  select c.id into conv_id
  from public.conversations c
  where c.is_group = false
    and (
      select count(*) from public.conversation_members where conversation_id = c.id
    ) = 2
    and exists (
      select 1 from public.conversation_members
      where conversation_id = c.id and user_id = me
    )
    and exists (
      select 1 from public.conversation_members
      where conversation_id = c.id and user_id = other_user_id
    )
  limit 1;

  if conv_id is not null then
    return conv_id;
  end if;

  insert into public.conversations (is_group) values (false) returning id into conv_id;
  insert into public.conversation_members (conversation_id, user_id)
    values (conv_id, me), (conv_id, other_user_id);
  return conv_id;
end;
$$;

revoke all on function public.find_or_create_dm(uuid) from public;
grant execute on function public.find_or_create_dm(uuid) to authenticated;

-- ---------- 6. Bump conversations.last_message_at on new message ----------
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
    set last_message_at = NEW.created_at
    where id = NEW.conversation_id;
  return NEW;
end;
$$;

drop trigger if exists on_message_insert on public.messages;
create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- ---------- 7. Realtime: enable on messages so threads update live ----------
-- Safe to run repeatedly: catches the duplicate-add error so re-runs don't fail.
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then
  null;
end;
$$;
