CREATE TABLE public.lesson_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name text NOT NULL,
 mobile text NOT NULL,
 email text NOT NULL,
 vehicle_type text NOT NULL CHECK (vehicle_type IN ('Car','Bike','Scooter','Auto')),
 experience text NOT NULL CHECK (experience IN ('Beginner','Intermediate','Advanced')),
 preferred_date date NOT NULL,
 preferred_time time NOT NULL,
 message text,
 payment_choice text NOT NULL DEFAULT 'Pay after confirmation' CHECK (payment_choice IN ('Pay after confirmation','UPI','Card','Cash')),
 payment_status text NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid','Pending verification','Paid','Refunded')),
 amount integer,
 status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Confirmed','In Progress','Completed','Cancelled')),
 instructor text,
 staff_notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.lesson_bookings TO anon, authenticated;
GRANT SELECT, UPDATE ON public.lesson_bookings TO authenticated;
GRANT ALL ON public.lesson_bookings TO service_role;
ALTER TABLE public.lesson_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors request lessons" ON public.lesson_bookings FOR INSERT TO anon, authenticated WITH CHECK (status = 'New' AND payment_status = 'Unpaid' AND amount IS NULL AND instructor IS NULL AND staff_notes IS NULL AND preferred_date >= CURRENT_DATE);
CREATE POLICY "Staff view lessons" ON public.lesson_bookings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage lessons" ON public.lesson_bookings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER lesson_bookings_touch BEFORE UPDATE ON public.lesson_bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.protect_partner_application_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP = 'INSERT' AND NOT public.is_staff(auth.uid()) THEN
  IF NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.status NOT IN ('Draft','Submitted','Payment Pending') OR NEW.payment_status NOT IN ('Pending','Under Verification') OR NEW.payment_verified_at IS NOT NULL OR NEW.partner_id IS NOT NULL OR NEW.admin_notes IS NOT NULL OR NEW.rejection_reason IS NOT NULL OR NEW.deposit_amount <> 2000 OR NEW.payment_paid_at IS NOT NULL THEN
   RAISE EXCEPTION 'Restricted partner application fields';
  END IF;
 END IF;
 IF TG_OP = 'UPDATE' AND NOT public.is_staff(auth.uid()) THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.status IS DISTINCT FROM OLD.status OR NEW.payment_status IS DISTINCT FROM OLD.payment_status OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount OR NEW.payment_verified_at IS DISTINCT FROM OLD.payment_verified_at OR NEW.payment_paid_at IS DISTINCT FROM OLD.payment_paid_at OR NEW.partner_id IS DISTINCT FROM OLD.partner_id OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason OR NEW.terms_accepted IS DISTINCT FROM OLD.terms_accepted THEN
   RAISE EXCEPTION 'Only staff can change verification or ownership';
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER protect_partner_application BEFORE INSERT OR UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.protect_partner_application_fields();
CREATE OR REPLACE FUNCTION public.protect_partner_document_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NOT public.is_staff(auth.uid()) THEN
  IF TG_OP = 'INSERT' THEN
   IF NOT EXISTS (SELECT 1 FROM public.partner_applications WHERE id = NEW.application_id AND user_id = auth.uid()) OR NEW.verified OR NEW.verified_at IS NOT NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Invalid partner document';
   END IF;
  ELSIF TG_OP = 'UPDATE' THEN
   IF NEW.application_id IS DISTINCT FROM OLD.application_id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.verified IS DISTINCT FROM OLD.verified OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
    RAISE EXCEPTION 'Only staff can verify documents';
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER protect_partner_document BEFORE INSERT OR UPDATE ON public.partner_documents FOR EACH ROW EXECUTE FUNCTION public.protect_partner_document_fields();