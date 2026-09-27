CREATE OR REPLACE FUNCTION public.claim_initial_admin() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE caller uuid := auth.uid();
BEGIN
 IF caller IS NULL THEN RETURN false; END IF;
 IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = caller AND lower(email) = 'inofdriving@gmail.com' AND email_confirmed_at IS NOT NULL) THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(2026, 91923);
 IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
 INSERT INTO public.user_roles (user_id, role) VALUES (caller, 'admin') ON CONFLICT DO NOTHING;
 RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = caller AND role = 'admin');
END; $$;
REVOKE ALL ON FUNCTION public.claim_initial_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_initial_admin() TO authenticated;