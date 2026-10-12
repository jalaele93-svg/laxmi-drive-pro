-- Test-mode transaction ledger; no customer course balances are changed by these rows.
create table if not exists public.razorpay_test_payments (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  vehicle_type text not null check (vehicle_type in ('Car','Bike','Scooter','Auto')),
  amount_paise integer not null check (amount_paise > 0),
  status text not null default 'created' check (status in ('created','captured','failed')),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
alter table public.razorpay_test_payments enable row level security;
-- No public policies: only Edge Functions using service role can access these rows.
