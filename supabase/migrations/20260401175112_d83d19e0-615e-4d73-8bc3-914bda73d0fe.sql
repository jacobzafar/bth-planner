
CREATE TABLE public.course_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.user_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subtasks" ON public.course_subtasks
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks" ON public.course_subtasks
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks" ON public.course_subtasks
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks" ON public.course_subtasks
  FOR DELETE TO public USING (auth.uid() = user_id);
