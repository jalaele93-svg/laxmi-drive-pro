-- Replace protect_partner_application_fields trigger function with text-coerced comparisons
-- to avoid enum cast failures on partner_payment_status.
CREATE OR REPLACE FUNCTION public.protect_partner_application_fields() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' AND NOT public.is_staff(auth.uid()) AND auth.role() IS DISTINCT FROM 'service_role' THEN
  IF NEW.user_id IS DISTINCT FROM auth.uid() 
     OR NEW.status::text NOT IN ('Draft','Submitted','Payment Pending') 
     OR NEW.payment_status::text NOT IN ('Pending','Under Verification') 
     OR NEW.payment_verified_at IS NOT NULL 
     OR NEW.partner_id IS NOT NULL 
     OR NEW.admin_notes IS NOT NULL 
     OR NEW.rejection_reason IS NOT NULL 
     OR NEW.deposit_amount<>2000 
     OR NEW.payment_paid_at IS NOT NULL 
     OR NEW.vehicle_verified 
     OR NEW.vehicle_verified_at IS NOT NULL 
     OR (NEW.payment_status::text='Under Verification' AND nullif(btrim(NEW.payment_reference),'') IS NULL) THEN
   RAISE EXCEPTION 'Restricted partner application fields';
  END IF;
 END IF;
 IF TG_OP='UPDATE' AND NOT public.is_staff(auth.uid()) AND auth.role() IS DISTINCT FROM 'service_role' THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id 
     OR NEW.status IS DISTINCT FROM OLD.status 
     OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount 
     OR NEW.payment_verified_at IS DISTINCT FROM OLD.payment_verified_at 
     OR NEW.payment_paid_at IS DISTINCT FROM OLD.payment_paid_at 
     OR NEW.partner_id IS DISTINCT FROM OLD.partner_id 
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes 
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason 
     OR NEW.terms_accepted IS DISTINCT FROM OLD.terms_accepted 
     OR NEW.vehicle_verified IS DISTINCT FROM OLD.vehicle_verified 
     OR NEW.vehicle_verified_at IS DISTINCT FROM OLD.vehicle_verified_at 
     OR (NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NOT(OLD.payment_status::text = 'Pending' AND NEW.payment_status::text='Under Verification' AND nullif(btrim(NEW.payment_reference),'') IS NOT NULL)) THEN
   RAISE EXCEPTION 'Only staff can change verification or ownership';
  END IF;
 END IF;
 IF NEW.status::text IN ('Approved','Active') AND (NEW.payment_status::text<>'Verified' OR NOT NEW.vehicle_verified OR EXISTS(SELECT 1 FROM unnest(ARRAY['rc','insurance','puc','licence','photo_front','photo_rear']) AS required(doc_type) WHERE NOT EXISTS(SELECT 1 FROM public.partner_documents d WHERE d.application_id=NEW.id AND d.doc_type=required.doc_type AND d.is_current AND d.verified))) THEN
  RAISE EXCEPTION 'Verify payment, vehicle and all required documents before approval';
 END IF;
 RETURN NEW;
END; $$;
