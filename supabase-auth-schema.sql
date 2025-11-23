-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user' check (role in ('user', 'admin', 'moderator'))
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Add user_id to incidents table
alter table incidents 
add column user_id uuid references auth.users(id);

-- Enable RLS on incidents
alter table incidents enable row level security;

-- Policy: Users can view their own incidents
create policy "Users can view own incidents"
  on incidents for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own incidents
create policy "Users can insert own incidents"
  on incidents for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own incidents
create policy "Users can update own incidents"
  on incidents for update
  using ( auth.uid() = user_id );

-- Policy: Admins can view all incidents
create policy "Admins can view all incidents"
  on incidents for select
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
