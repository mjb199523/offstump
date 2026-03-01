-- Run this in your Supabase SQL Editor to implement ATOMIC Verification!
CREATE OR REPLACE FUNCTION public.verify_and_consume_bmi_ticket(p_ticket uuid)
RETURNS TABLE (email text) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass RLS
AS $$
DECLARE
    v_user_id uuid;
    v_email text;
BEGIN
    -- Find the active, non-expired ticket in ONE step
    SELECT id, profiles.email INTO v_user_id, v_email 
    FROM profiles 
    WHERE bmi_ticket = p_ticket 
      AND bmi_ticket IS NOT NULL 
      AND bmi_ticket_expires > now()
    FOR UPDATE; -- Lock the row to prevent race conditions

    IF v_user_id IS NOT NULL THEN
        -- Consume it IMMEDIATELY
        UPDATE profiles 
        SET bmi_ticket = NULL, bmi_ticket_expires = NULL 
        WHERE id = v_user_id;
        
        RETURN QUERY SELECT v_email;
    END IF;
END;
$$;

-- Flush cache
NOTIFY pgrst, 'reload schema';
