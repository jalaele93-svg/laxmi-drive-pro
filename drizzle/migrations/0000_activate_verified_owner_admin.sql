CREATE OR REPLACE FUNCTION public.activate_verified_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF lower(OLD.email) = 'inofdriving@gmail.com' AND (lower(NEW.email) IS DISTINCT FROM 'inofdriving@gmail.com' OR NEW.email_confirmed_at IS NULL) THEN
      DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin'::public.app_role;
    END IF;
  END IF;
  IF lower(NEW.email) = 'inofdriving@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, 'admin'::public.app_role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_verified_owner_admin() FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION public.activate_verified_owner_admin() IS 'Auth lifecycle only: activate the designated owner after verified email ownership; not a client-callable role-claim RPC.';
CREATE TRIGGER activate_verified_owner_admin_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.activate_verified_owner_admin();
CREATE TRIGGER activate_verified_owner_admin_on_verification
AFTER UPDATE OF email, email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.activate_verified_owner_admin();