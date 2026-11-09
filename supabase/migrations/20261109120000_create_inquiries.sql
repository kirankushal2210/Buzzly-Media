-- Buzzly website inquiries.
--
-- Written to by the server-side /api/contact route only, using the Supabase
-- secret (service_role) key. Website visitors never talk to this table
-- directly: RLS is on, there are no policies, and anon/authenticated have no
-- table or function privileges.
--
-- Retries: the browser sends one idempotency key per submission attempt.
-- submit_inquiry() returns the existing row for a repeated key instead of
-- inserting a second one, and claim_inquiry_notification() lets exactly one
-- request send notifications at a time, so concurrent retries cannot double-send.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- One per form submission attempt (generated in the browser, reused on retry).
  idempotency_key uuid not null unique,

  -- Form fields. Limits mirror lib/inquiry-validation.ts.
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 200 and position('@' in email) > 1),
  company text not null default '' check (char_length(company) <= 120),
  inquiry_type text not null check (inquiry_type in ('content', 'brand', 'distribution', 'partnership', 'other')),
  message text not null check (char_length(message) between 20 and 5000),

  -- Salted SHA-256 of the visitor's IP, only for the hourly rate limit. Never the raw IP.
  ip_hash text check (ip_hash ~ '^[0-9a-f]{64}$'),

  -- Notification tracking.
  --   pending  saved, nobody has tried to notify yet
  --   sending  a request holds the claim (expires after a short lease)
  --   sent     every configured team channel delivered
  --   failed   at least one configured channel failed (see notification_error)
  --   skipped  no team channel was configured; the inquiry is only in this table
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  -- Per-channel result, e.g. {"email":"sent","slack":"failed","discord":"skipped"}.
  notification_channels jsonb not null default '{}'::jsonb
    check (jsonb_typeof(notification_channels) = 'object'),
  notification_attempts smallint not null default 0 check (notification_attempts between 0 and 20),
  notification_claimed_at timestamptz,
  -- Short category only, e.g. "slack:http_500,email:timeout". Never provider responses or secrets.
  notification_error text check (char_length(notification_error) <= 200),
  notified_at timestamptz
);

comment on table public.inquiries is 'Website contact-form inquiries. Server-only (secret key); no public access.';

-- Dashboard listing, newest first.
create index inquiries_created_at_idx on public.inquiries (created_at desc);
-- Hourly rate-limit counts in submit_inquiry().
create index inquiries_ip_hash_created_at_idx on public.inquiries (ip_hash, created_at) where ip_hash is not null;
create index inquiries_email_created_at_idx on public.inquiries (email, created_at);
-- "Needs attention" view: inquiries whose notification has not succeeded.
create index inquiries_notification_open_idx on public.inquiries (created_at)
  where notification_status in ('pending', 'sending', 'failed');

alter table public.inquiries enable row level security;
-- No policies on purpose: with RLS on and no policy, anon/authenticated see and change nothing.
-- Privileges are revoked too, so access stays closed even if a permissive policy is added by mistake.
revoke all on table public.inquiries from public, anon, authenticated;
grant select, insert, update, delete on table public.inquiries to service_role;


-- Save an inquiry, or return the existing one when the same idempotency key is retried.
-- outcome: created | duplicate | key_conflict (same key, different content) | rate_limited
create function public.submit_inquiry(
  p_idempotency_key uuid,
  p_name text,
  p_email text,
  p_company text,
  p_inquiry_type text,
  p_message text,
  p_ip_hash text,
  p_window_minutes integer default 60,
  p_max_per_ip integer default 5,
  p_max_per_email integer default 3
)
returns table (inquiry_id uuid, outcome text, notification_status text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing public.inquiries%rowtype;
  new_id uuid;
  since timestamptz := now() - make_interval(mins => p_window_minutes);
begin
  -- A retry of a submission we already have: answer from the stored row, never re-insert
  -- and never count it against the rate limit.
  select * into existing from public.inquiries i where i.idempotency_key = p_idempotency_key;
  if found then
    if (existing.name, existing.email, existing.company, existing.inquiry_type, existing.message)
       = (p_name, p_email, p_company, p_inquiry_type, p_message) then
      return query select existing.id, 'duplicate'::text, existing.notification_status;
    else
      return query select null::uuid, 'key_conflict'::text, null::text;
    end if;
    return;
  end if;

  if p_ip_hash is not null and (
    select count(*) from public.inquiries i where i.ip_hash = p_ip_hash and i.created_at > since
  ) >= p_max_per_ip then
    return query select null::uuid, 'rate_limited'::text, null::text;
    return;
  end if;

  if (select count(*) from public.inquiries i where i.email = p_email and i.created_at > since) >= p_max_per_email then
    return query select null::uuid, 'rate_limited'::text, null::text;
    return;
  end if;

  insert into public.inquiries (idempotency_key, name, email, company, inquiry_type, message, ip_hash)
  values (p_idempotency_key, p_name, p_email, coalesce(p_company, ''), p_inquiry_type, p_message, p_ip_hash)
  on conflict (idempotency_key) do nothing
  returning id into new_id;

  if new_id is not null then
    return query select new_id, 'created'::text, 'pending'::text;
    return;
  end if;

  -- A concurrent request with the same key inserted first; report its row.
  select * into existing from public.inquiries i where i.idempotency_key = p_idempotency_key;
  if (existing.name, existing.email, existing.company, existing.inquiry_type, existing.message)
     = (p_name, p_email, p_company, p_inquiry_type, p_message) then
    return query select existing.id, 'duplicate'::text, existing.notification_status;
  else
    return query select null::uuid, 'key_conflict'::text, null::text;
  end if;
end;
$$;


-- Take the right to send notifications for one inquiry. Returns a row only for the
-- single caller that wins; concurrent callers get no row and must not send anything.
-- A claim left by a crashed request expires after p_lease_seconds.
create function public.claim_inquiry_notification(
  p_inquiry_id uuid,
  p_lease_seconds integer default 90,
  p_max_attempts integer default 3
)
returns table (channels jsonb, attempts smallint)
language sql
security invoker
set search_path = ''
as $$
  update public.inquiries i
     set notification_status = 'sending',
         notification_claimed_at = now(),
         notification_attempts = i.notification_attempts + 1
   where i.id = p_inquiry_id
     and i.notification_attempts < p_max_attempts
     and (
       i.notification_status in ('pending', 'failed')
       or (i.notification_status = 'sending' and i.notification_claimed_at < now() - make_interval(secs => p_lease_seconds))
     )
  returning i.notification_channels, i.notification_attempts;
$$;


-- Record the outcome of a claimed notification attempt. Per-channel results are merged,
-- so a later attempt only needs to report the channels it retried.
create function public.finish_inquiry_notification(
  p_inquiry_id uuid,
  p_status text,
  p_channels jsonb,
  p_error text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'failed', 'skipped') then
    raise exception 'invalid notification status: %', p_status;
  end if;
  update public.inquiries i
     set notification_status = p_status,
         notification_channels = i.notification_channels || coalesce(p_channels, '{}'::jsonb),
         notification_error = left(nullif(p_error, ''), 200),
         notified_at = case when p_status = 'sent' then now() else i.notified_at end,
         notification_claimed_at = null
   where i.id = p_inquiry_id
     and i.notification_status = 'sending';
end;
$$;

-- Supabase grants EXECUTE on new public functions to anon/authenticated by default; take it back.
revoke all on function public.submit_inquiry(uuid, text, text, text, text, text, text, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.claim_inquiry_notification(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.finish_inquiry_notification(uuid, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_inquiry(uuid, text, text, text, text, text, text, integer, integer, integer) to service_role;
grant execute on function public.claim_inquiry_notification(uuid, integer, integer) to service_role;
grant execute on function public.finish_inquiry_notification(uuid, text, jsonb, text) to service_role;
