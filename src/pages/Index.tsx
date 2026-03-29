import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import AuthPage from '@/components/AuthPage';
import ProgramSetupPage from '@/components/ProgramSetupPage';
import CourseStatusPage from '@/components/CourseStatusPage';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import AddEventPage from '@/components/AddEventPage';

import CalendarPage from '@/components/CalendarPage';
import SettingsPage from '@/components/SettingsPage';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<{ program_name: string | null; start_year: number | null } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Defer profile check
        setTimeout(() => checkProfile(session.user.id), 0);
      } else {
        setSetupComplete(null);
        setProfileData(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('setup_complete, program_name, start_year')
      .eq('user_id', userId)
      .single();

    setSetupComplete(data?.setup_complete ?? false);
    setProfileData(data ? { program_name: data.program_name, start_year: data.start_year } : null);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <AuthPage />;
  }

  // Logged in but hasn't selected program
  if (!setupComplete) {
    return (
      <ProgramSetupPage
        userId={session.user.id}
        onComplete={() => {
          checkProfile(session.user.id);
        }}
      />
    );
  }

  // Main app
  return (
    <AppLayout programName={profileData?.program_name || ''} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard userId={session.user.id} />} />
        <Route path="/kurser" element={<CourseStatusPage userId={session.user.id} />} />
        <Route path="/add-event" element={<AddEventPage userId={session.user.id} />} />
        <Route path="/kalender" element={<CalendarPage userId={session.user.id} />} />
        <Route path="/installningar" element={<SettingsPage programName={profileData?.program_name || ''} startYear={profileData?.start_year || 0} onLogout={handleLogout} />} />
      </Routes>
    </AppLayout>
  );
}
