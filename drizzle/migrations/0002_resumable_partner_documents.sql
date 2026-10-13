ALTER TABLE public.partner_documents ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;
WITH ranked AS (SELECT id,row_number() OVER (PARTITION BY application_id,doc_type ORDER BY created_at DESC,id DESC) AS n FROM public.partner_documents) UPDATE public.partner_documents d SET is_current=false FROM ranked r WHERE d.id=r.id AND r.n>1;
CREATE UNIQUE INDEX IF NOT EXISTS partner_document_current_unique ON public.partner_documents(application_id,doc_type) WHERE is_current;
CREATE OR REPLACE FUNCTION public.protect_partner_application_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP = 'INSERT' AND NOT public.is_staff(auth.uid()) AND auth.role() IS DISTINCT FROM 'service_role' THEN
  IF NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.status NOT IN ('Draft','Submitted','Payment Pending') OR NEW.payment_status NOT IN ('Pending','Under Verification') OR NEW.payment_verified_at IS NOT NULL OR NEW.partner_id IS NOT NULL OR NEW.admin_notes IS NOT NULL OR NEW.rejection_reason IS NOT NULL OR NEW.deposit_amount <> 2000 OR NEW.payment_paid_at IS NOT NULL OR NEW.vehicle_verified OR NEW.vehicle_verified_at IS NOT NULL OR (NEW.payment_status = 'Under Verification' AND nullif(btrim(NEW.payment_reference), '') IS NULL) THEN RAISE EXCEPTION 'Restricted partner application fields'; END IF;
 END IF;
 IF TG_OP = 'UPDATE' AND NOT public.is_staff(auth.uid()) AND auth.role() IS DISTINCT FROM 'service_role' THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.status IS DISTINCT FROM OLD.status OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount OR NEW.payment_verified_at IS DISTINCT FROM OLD.payment_verified_at OR NEW.payment_paid_at IS DISTINCT FROM OLD.payment_paid_at OR NEW.partner_id IS DISTINCT FROM OLD.partner_id OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason OR NEW.terms_accepted IS DISTINCT FROM OLD.terms_accepted OR NEW.vehicle_verified IS DISTINCT FROM OLD.vehicle_verified OR NEW.vehicle_verified_at IS DISTINCT FROM OLD.vehicle_verified_at OR (NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NOT (OLD.payment_status = 'Pending' AND NEW.payment_status = 'Under Verification' AND nullif(btrim(NEW.payment_reference), '') IS NULL)) THEN RAISE EXCEPTION 'Only staff can change verification or ownership'; END IF;
 END IF;
 IF NEW.status IN ('Approved','Active') THEN
  IF NEW.payment_status <> 'Verified' OR NOT NEW.vehicle_verified OR EXISTS (SELECT 1 FROM unnest(ARRAY['rc','insurance','puc','licence','photo_front','photo_rear']) AS required(doc_type) WHERE NOT EXISTS (SELECT 1 FROM public.partner_documents d WHERE d.application_id=NEW.id AND d.doc_type=required.doc_type AND d.is_current AND d.verified)) THEN RAISE EXCEPTION 'Verify payment, vehicle and all required documents before approval'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.protect_partner_document_fields() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT public.is_staff(auth.uid()) AND auth.role() IS DISTINCT FROM 'service_role' THEN
  IF TG_OP='INSERT' THEN
   IF NOT EXISTS(SELECT 1 FROM public.partner_applications WHERE id=NEW.application_id AND user_id=auth.uid() AND status IN ('Draft','Correction Required','Payment Pending','Submitted')) OR NEW.verified OR NEW.verified_at IS NOT NULL OR NEW.user_id IS DISTINCT FROM auth.uid() OR NOT NEW.is_current THEN RAISE EXCEPTION 'Invalid partner document'; END IF;
  ELSIF TG_OP='UPDATE' THEN
   IF NEW.application_id IS DISTINCT FROM OLD.application_id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.verified IS DISTINCT FROM OLD.verified OR NEW.verified_at IS DISTINCT FROM OLD.verified_at OR NEW.is_current IS DISTINCT FROM OLD.is_current THEN RAISE EXCEPTION 'Only staff can verify or replace documents'; END IF;
  END IF;
 END IF;
 IF NEW.doc_type NOT IN ('rc','insurance','puc','licence','photo_front','photo_rear','photo_side','photo_interior') OR NEW.mime_type NOT IN ('image/jpeg','image/png','application/pdf') OR NEW.file_size IS NULL OR NEW.file_size<=0 OR NEW.file_size>10485760 OR split_part(NEW.file_path,'/',1) IS DISTINCT FROM NEW.user_id::text OR split_part(NEW.file_path,'/',2) IS DISTINCT FROM NEW.application_id::text THEN RAISE EXCEPTION 'Invalid document metadata'; END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.replace_partner_document(_application_id uuid,_user_id uuid,_doc_type text,_file_path text,_file_name text,_mime_type text,_file_size integer) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE _id uuid;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Forbidden'; END IF;
 PERFORM 1 FROM public.partner_applications WHERE id=_application_id AND user_id=_user_id AND status IN ('Draft','Correction Required','Payment Pending','Submitted') FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application is not editable'; END IF;
 SELECT id INTO _id FROM public.partner_documents WHERE application_id=_application_id AND doc_type=_doc_type AND file_path=_file_path AND is_current;
 IF _id IS NOT NULL THEN RETURN _id; END IF;
 UPDATE public.partner_documents SET is_current=false WHERE application_id=_application_id AND doc_type=_doc_type AND is_current;
 INSERT INTO public.partner_documents(application_id,user_id,doc_type,file_path,file_name,mime_type,file_size) VALUES(_application_id,_user_id,_doc_type,_file_path,_file_name,_mime_type,_file_size) RETURNING id INTO _id;
 UPDATE public.partner_applications SET vehicle_verified=false,vehicle_verified_at=NULL WHERE id=_application_id;
 RETURN _id;
END; $$;
REVOKE ALL ON FUNCTION public.replace_partner_document(uuid,uuid,text,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.replace_partner_document(uuid,uuid,text,text,text,text,integer) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_partner_storage_upload() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF NEW.bucket_id='partner-documents' THEN
  IF NEW.metadata IS NOT NULL AND ((NEW.metadata->>'mimetype') NOT IN ('image/jpeg','image/png','application/pdf') OR coalesce((NEW.metadata->>'size')::bigint,0)>10485760) THEN RAISE EXCEPTION 'Only JPG, PNG or PDF under 10 MB is allowed'; END IF;
 END IF;
 RETURN NEW;
END; $$;