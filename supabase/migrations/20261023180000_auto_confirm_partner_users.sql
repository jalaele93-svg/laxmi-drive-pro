-- Auto-confirm partner users and enable robust phone-based login

-- 1. Create trigger function to auto-confirm partner registrations without requiring manual email link
CREATE OR REPLACE FUNCTION public.auto_confirm_partner_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- If phone-based partner signup or marked as partner
  IF NEW.email LIKE '%@partner.laxmidriving.com' OR (NEW.raw_user_meta_data->>'is_partner')::boolean = true THEN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_before_insert_partner ON auth.users;
CREATE TRIGGER on_auth_user_before_insert_partner
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_partner_user();

-- 2. Confirm any existing partner users that were stuck in unconfirmed state
UPDATE auth.users
SET email_confirmed_at = now()
WHERE (email LIKE '%@partner.laxmidriving.com' OR (raw_user_meta_data->>'is_partner')::boolean = true)
  AND email_confirmed_at IS NULL;

-- 3. Database function to resolve a 10-digit mobile number to the user's authentic login email
CREATE OR REPLACE FUNCTION public.get_partner_auth_email(_mobile text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  clean_mob text;
  found_email text;
BEGIN
  clean_mob := right(regexp_replace(_mobile, '\D', '', 'g'), 10);
  IF length(clean_mob) <> 10 THEN
    RETURN NULL;
  END IF;
  
  -- Check in profiles first
  SELECT u.email INTO found_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE right(regexp_replace(p.mobile, '\D', '', 'g'), 10) = clean_mob
  ORDER BY p.created_at DESC
  LIMIT 1;

  IF found_email IS NOT NULL THEN
    RETURN found_email;
  END IF;

  -- Default fallback to phone format
  RETURN clean_mob || '@partner.laxmidriving.com';
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_partner_auth_email(text) TO anon, authenticated, service_role;
