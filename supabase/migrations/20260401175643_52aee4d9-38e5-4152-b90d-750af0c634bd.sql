
ALTER TABLE public.course_subtasks
  ADD COLUMN due_date DATE,
  ADD COLUMN hp NUMERIC DEFAULT 0,
  ADD COLUMN event_id UUID REFERENCES public.study_events(id) ON DELETE SET NULL;
