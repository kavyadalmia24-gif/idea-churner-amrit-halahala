-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create churn_history table
create table public.churn_history (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_text text not null,
  idea_b_text text,
  is_humanity_mode boolean default false,
  amrit_view text not null,
  halahala_view text not null,
  bvi_score integer not null,
  shiva_mode text not null,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table public.churn_history enable row level security;

-- Churn history policies
create policy "Users can view their own churn history"
  on public.churn_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own churn history"
  on public.churn_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own churn history"
  on public.churn_history for delete
  using (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();