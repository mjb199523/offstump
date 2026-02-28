-- Create the events table
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name text NOT NULL,
  page_path text NOT NULL,
  referrer text,
  device text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Note: Depending on your exact requirements, you might want to create an index
-- to make querying faster for analytics (e.g. by created_at or event_name)
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_event_name ON public.events(event_name);

-- RLS (Row Level Security) Guidelines
-- 1. We ONLY insert events via a trusted server API route, not directly from frontend.
-- 2. So we can disable RLS for the time being, or enable RLS but only give 
--    the service_role key access. 
-- For a safe robust setup:
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow nothing for anon / authenticated, so nobody can select or insert from the client side.
-- (The server-side API will use the Service Role Key which bypasses RLS).
