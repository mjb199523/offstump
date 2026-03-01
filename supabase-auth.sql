-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text default 'user' check (role in ('user', 'admin')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

---- Run this in your Supabase SQL Editor to fix the BMI access error!
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS bmi_ticket uuid;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS bmi_ticket_expires timestamp with time zone;

-- Optimized index for ticket verification
CREATE INDEX IF NOT EXISTS idx_profiles_bmi_ticket ON public.profiles(bmi_ticket);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone with a service role key to bypass RLS, but let's be explicit where needed
-- Users can see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

-- Admins can view/update all profiles
-- To avoid infinite recursion, we use auth.uid() = id directly inside the query that checks admin role
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Trigger to automatically create a profile when an admin creates a user in Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, is_active)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'user'), coalesce((new.raw_user_meta_data->>'is_active')::boolean, true));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
