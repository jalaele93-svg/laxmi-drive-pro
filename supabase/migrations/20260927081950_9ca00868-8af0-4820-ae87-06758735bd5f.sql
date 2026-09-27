CREATE TABLE public.instructor_roster (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, specialty text NOT NULL, experience_years integer NOT NULL DEFAULT 0, languages text[] NOT NULL DEFAULT '{}', vehicles text[] NOT NULL DEFAULT '{}', availability text NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available','On Lesson','Leave')), daily_capacity integer NOT NULL DEFAULT 6 CHECK (daily_capacity BETWEEN 1 AND 20), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instructor_roster TO authenticated;
GRANT ALL ON public.instructor_roster TO service_role;
ALTER TABLE public.instructor_roster ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage instructors" ON public.instructor_roster FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER instructor_roster_touch BEFORE UPDATE ON public.instructor_roster FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.site_settings (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), institute_name text NOT NULL DEFAULT 'Laxmi Driving Training', phone text NOT NULL DEFAULT '+91 70088 91923', email text NOT NULL DEFAULT 'info@laxmidriving.com', slot_minutes integer NOT NULL DEFAULT 45 CHECK (slot_minutes BETWEEN 15 AND 240), max_lessons_daily integer NOT NULL DEFAULT 6 CHECK (max_lessons_daily BETWEEN 1 AND 20), first_slot time NOT NULL DEFAULT '07:00', last_slot time NOT NULL DEFAULT '19:00', sms_enabled boolean NOT NULL DEFAULT false, whatsapp_enabled boolean NOT NULL DEFAULT false, auto_allocate boolean NOT NULL DEFAULT false, online_payments boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();