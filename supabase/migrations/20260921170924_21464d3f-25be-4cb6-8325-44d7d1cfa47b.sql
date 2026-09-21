-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','staff','partner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'))
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  mobile text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Staff read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'mobile', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENUMS
CREATE TYPE public.partner_vehicle_type AS ENUM ('Car','Motorcycle','Scooter');
CREATE TYPE public.partner_application_status AS ENUM (
  'Draft','Submitted','Payment Pending','Payment Received','Document Verification',
  'Under Review','Approved','Rejected','Correction Required','Active','Suspended');
CREATE TYPE public.partner_payment_status AS ENUM ('Pending','Paid','Under Verification','Verified','Refunded');
CREATE TYPE public.partner_ownership AS ENUM ('Individual Owner','Business Owner','Company/Fleet Owner');

-- APPLICATION NUMBER
CREATE SEQUENCE public.partner_application_seq START 123;

CREATE OR REPLACE FUNCTION public.set_partner_application_no()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.application_no IS NULL THEN
    NEW.application_no := 'LDT-PART-' || lpad(nextval('public.partner_application_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- APPLICATIONS
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_no text UNIQUE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text NOT NULL,
  alternate_mobile text,
  address text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  state text NOT NULL DEFAULT 'Odisha',
  pincode text NOT NULL,
  vehicle_type public.partner_vehicle_type NOT NULL,
  registration_number text NOT NULL,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  manufacturing_year integer NOT NULL,
  fuel_type text NOT NULL,
  transmission text NOT NULL,
  vehicle_color text,
  odometer_km integer,
  ownership_status public.partner_ownership NOT NULL DEFAULT 'Individual Owner',
  preferred_location text NOT NULL,
  preferred_use text NOT NULL,
  preferred_availability text NOT NULL,
  bank_account_name text,
  bank_name text,
  bank_account_number text,
  bank_ifsc text,
  upi_id text,
  terms_accepted boolean NOT NULL DEFAULT false,
  status public.partner_application_status NOT NULL DEFAULT 'Draft',
  deposit_amount integer NOT NULL DEFAULT 2000,
  payment_status public.partner_payment_status NOT NULL DEFAULT 'Pending',
  payment_method text,
  payment_reference text,
  payment_paid_at timestamptz,
  payment_verified_at timestamptz,
  partner_id text,
  admin_notes text,
  rejection_reason text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners read own application" ON public.partner_applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Partners create own application" ON public.partner_applications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Partners update editable application" ON public.partner_applications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('Draft','Correction Required','Payment Pending','Submitted'))
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff read all applications" ON public.partner_applications
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update all applications" ON public.partner_applications
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER partner_applications_set_no
BEFORE INSERT ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.set_partner_application_no();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER partner_applications_touch
BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch
BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- DOCUMENTS
CREATE TABLE public.partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size integer,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_documents TO authenticated;
GRANT ALL ON public.partner_documents TO service_role;
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners manage own documents" ON public.partner_documents
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff read all documents" ON public.partner_documents
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update all documents" ON public.partner_documents
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- STORAGE POLICIES
CREATE POLICY "Partners read own partner files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Partners upload own partner files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Partners delete own partner files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'partner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Staff read partner files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents' AND public.is_staff(auth.uid()));