CREATE TABLE public.website_content (
 id text PRIMARY KEY,
 section text NOT NULL CHECK (section IN ('courses','instructors','testimonials','faqs','safetyRules')),
 content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
 visible boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.website_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_content TO authenticated;
GRANT ALL ON public.website_content TO service_role;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public website content" ON public.website_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff edit website content" ON public.website_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER website_content_updated BEFORE UPDATE ON public.website_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
COMMENT ON TABLE public.website_content IS 'Public marketing content overrides; visible controls display, not confidentiality. Operational roster and private learner records remain separate.';