-- Profiles table for user settings and onboarding state.
-- Run this in Supabase SQL Editor or via: supabase db push

alter table public.profiles
  add column onboarding_completed_at timestamptz;

-- RLS: users can read/update their own profile only.
alter table public.profiles enable row level security;

