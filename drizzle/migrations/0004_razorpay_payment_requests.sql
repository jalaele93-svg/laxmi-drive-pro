ALTER TABLE public.lesson_bookings ADD COLUMN IF NOT EXISTS gateway_only boolean NOT NULL DEFAULT false;
ALTER TABLE public.partner_applications ADD COLUMN IF NOT EXISTS gateway_only boolean NOT NULL DEFAULT false;
CREATE TABLE public.payment_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 booking_id uuid REFERENCES public.lesson_bookings(id),
 application_id uuid REFERENCES public.partner_applications(id),
 token_hash text UNIQUE,
 amount_paise bigint NOT NULL CHECK(amount_paise>0 AND amount_paise<=100000000),
 currency text NOT NULL DEFAULT 'INR' CHECK(currency='INR'),
 key_id text NOT NULL,
 order_id text UNIQUE,
 payment_id text UNIQUE,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','creating','captured','refunded')),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((booking_id IS NOT NULL)::int + (application_id IS NOT NULL)::int = 1)
);
GRANT SELECT ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view gateway records" ON public.payment_requests FOR SELECT TO authenticated USING(public.is_staff(auth.uid()));
CREATE UNIQUE INDEX payment_request_booking ON public.payment_requests(booking_id) WHERE booking_id IS NOT NULL;
CREATE UNIQUE INDEX payment_request_application ON public.payment_requests(application_id) WHERE application_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.guard_gateway_fields() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF OLD.gateway_only AND NOT NEW.gateway_only THEN RAISE EXCEPTION 'Gateway collection cannot be disabled'; END IF;
  IF NEW.gateway_only AND auth.role() IS DISTINCT FROM 'service_role' THEN
   IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN RAISE EXCEPTION 'Payment status requires gateway verification'; END IF;
   IF TG_TABLE_NAME='lesson_bookings' AND NEW.amount IS DISTINCT FROM OLD.amount AND EXISTS(SELECT 1 FROM public.payment_requests WHERE booking_id=OLD.id) THEN RAISE EXCEPTION 'A payment link already fixes this amount'; END IF;
  END IF;
 ELSIF NEW.gateway_only AND ((TG_TABLE_NAME='lesson_bookings' AND NEW.payment_status<>'Unpaid') OR (TG_TABLE_NAME='partner_applications' AND NEW.payment_status<>'Pending')) THEN RAISE EXCEPTION 'New gateway payment must be pending';
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_lesson_gateway BEFORE INSERT OR UPDATE ON public.lesson_bookings FOR EACH ROW EXECUTE FUNCTION public.guard_gateway_fields();
CREATE TRIGGER guard_partner_gateway BEFORE INSERT OR UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.guard_gateway_fields();
CREATE OR REPLACE FUNCTION public.settle_razorpay_payment(_order text,_payment text,_amount bigint,_refunded boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.payment_requests;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT * INTO r FROM public.payment_requests WHERE order_id=_order FOR UPDATE;
 IF NOT FOUND OR r.amount_paise<>_amount THEN RAISE EXCEPTION 'Order or amount mismatch'; END IF;
 IF r.payment_id IS NOT NULL AND r.payment_id<>_payment THEN RAISE EXCEPTION 'Payment mismatch'; END IF;
 IF r.state='refunded' THEN RETURN; END IF;
 UPDATE public.payment_requests SET payment_id=_payment,state=CASE WHEN _refunded THEN 'refunded' ELSE 'captured' END WHERE id=r.id;
 IF r.booking_id IS NOT NULL THEN
  UPDATE public.lesson_bookings SET payment_status=CASE WHEN _refunded THEN 'Refunded' ELSE 'Paid' END WHERE id=r.booking_id AND amount*100=r.amount_paise;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking quote changed'; END IF;
 ELSE
  UPDATE public.partner_applications SET payment_status=CASE WHEN _refunded THEN 'Refunded'::public.partner_payment_status ELSE 'Verified'::public.partner_payment_status END,payment_method='Razorpay',payment_reference=_payment,payment_paid_at=now(),payment_verified_at=now() WHERE id=r.application_id AND deposit_amount*100=r.amount_paise;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application amount changed'; END IF;
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.settle_razorpay_payment(text,text,bigint,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_razorpay_payment(text,text,bigint,boolean) TO service_role;