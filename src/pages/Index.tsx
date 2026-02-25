import { useStudyPlanner } from '@/lib/hooks';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from '@/components/LandingPage';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import AddEventPage from '@/components/AddEventPage';
import CoursesPage from '@/components/CoursesPage';
import CalendarPage from '@/components/CalendarPage';
import SettingsPage from '@/components/SettingsPage';
import { Course, StudyEvent } from '@/lib/types';
import { updateEvent } from '@/lib/store';

export default function Index() {
  const planner = useStudyPlanner();

  if (!planner.userData) {
    return (
      <LandingPage
        onSetup={(programName, courses) => {
          planner.createUser(programName, courses);
        }}
      />
    );
  }

  const handleCompleteEvent = (id: string) => {
    const event = planner.userData!.events.find(e => e.id === id);
    if (event) {
      planner.updateEvent({ ...event, status: 'complete' });
    }
  };

  return (
    <AppLayout userData={planner.userData} onLogout={planner.logout}>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard userData={planner.userData} onCompleteEvent={handleCompleteEvent} />
          }
        />
        <Route
          path="/add-event"
          element={
            <AddEventPage userData={planner.userData} onAddEvent={planner.addEvent} />
          }
        />
        <Route
          path="/courses"
          element={
            <CoursesPage
              userData={planner.userData}
              onAddCourse={planner.addCourse}
              onUpdateCourse={planner.updateCourse}
              onDeleteCourse={planner.deleteCourse}
            />
          }
        />
        <Route path="/calendar" element={<CalendarPage userData={planner.userData} />} />
        <Route
          path="/settings"
          element={<SettingsPage userData={planner.userData} onLogout={planner.logout} />}
        />
      </Routes>
    </AppLayout>
  );
}
