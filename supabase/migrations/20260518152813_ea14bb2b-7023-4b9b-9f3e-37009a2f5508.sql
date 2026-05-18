
-- Course requirement type enum
DO $$ BEGIN
  CREATE TYPE public.course_requirement_type AS ENUM (
    'completed_course',
    'attended_course',
    'completed_hp_in_course',
    'completed_hp_in_subject',
    'completed_total_hp',
    'custom_text'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Global course catalog
CREATE TABLE IF NOT EXISTS public.courses_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  hp NUMERIC NOT NULL DEFAULT 0,
  subject_area TEXT,
  level TEXT,
  original_prerequisite_text TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Programs
CREATE TABLE IF NOT EXISTS public.programs_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_hp NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Program -> Course link
CREATE TABLE IF NOT EXISTS public.program_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs_catalog(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses_catalog(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  semester TEXT,
  period TEXT,
  mandatory BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_program_courses_program ON public.program_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_program_courses_course ON public.program_courses(course_id);

-- Course prerequisites
CREATE TABLE IF NOT EXISTS public.course_prerequisites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_course_id UUID NOT NULL REFERENCES public.courses_catalog(id) ON DELETE CASCADE,
  requirement_type public.course_requirement_type NOT NULL,
  required_course_id UUID REFERENCES public.courses_catalog(id) ON DELETE SET NULL,
  required_hp NUMERIC,
  required_subject_area TEXT,
  original_text TEXT,
  logic_group INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_prereqs_target ON public.course_prerequisites(target_course_id);
CREATE INDEX IF NOT EXISTS idx_course_prereqs_required ON public.course_prerequisites(required_course_id);

-- Enable RLS
ALTER TABLE public.courses_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_prerequisites ENABLE ROW LEVEL SECURITY;

-- Read policies: any authenticated user can read
CREATE POLICY "Authenticated can read courses_catalog"
  ON public.courses_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can read programs_catalog"
  ON public.programs_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can read program_courses"
  ON public.program_courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can read course_prerequisites"
  ON public.course_prerequisites FOR SELECT TO authenticated USING (true);

-- Admin write policies
CREATE POLICY "Admins manage courses_catalog"
  ON public.courses_catalog FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage programs_catalog"
  ON public.programs_catalog FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage program_courses"
  ON public.program_courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage course_prerequisites"
  ON public.course_prerequisites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Timestamp triggers
CREATE TRIGGER trg_courses_catalog_updated
  BEFORE UPDATE ON public.courses_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_programs_catalog_updated
  BEFORE UPDATE ON public.programs_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_program_courses_updated
  BEFORE UPDATE ON public.program_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_course_prereqs_updated
  BEFORE UPDATE ON public.course_prerequisites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
