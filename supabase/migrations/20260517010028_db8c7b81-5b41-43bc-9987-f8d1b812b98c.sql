-- Add WITH CHECK to UPDATE policies to prevent cross-user row injection
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own courses" ON public.user_courses;
CREATE POLICY "Users can update own courses" ON public.user_courses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON public.study_events;
CREATE POLICY "Users can update own events" ON public.study_events
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subtasks" ON public.course_subtasks;
CREATE POLICY "Users can update own subtasks" ON public.course_subtasks
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Remove test account from production
DELETE FROM auth.users WHERE email = 'test@bthplanner.com';