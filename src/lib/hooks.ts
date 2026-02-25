import { useState, useCallback } from 'react';
import { UserData, Course, StudyEvent } from './types';
import * as store from './store';

export function useStudyPlanner() {
  const [userData, setUserData] = useState<UserData | null>(() => store.getUserData());

  const refresh = useCallback(() => {
    setUserData(store.getUserData());
  }, []);

  const createUser = useCallback((programName: string, courses: Omit<Course, 'id'>[]) => {
    const data = store.createUser(programName, courses);
    setUserData(data);
    return data;
  }, []);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse = store.addCourse(course);
    refresh();
    return newCourse;
  }, [refresh]);

  const updateCourse = useCallback((course: Course) => {
    store.updateCourse(course);
    refresh();
  }, [refresh]);

  const deleteCourse = useCallback((id: string) => {
    store.deleteCourse(id);
    refresh();
  }, [refresh]);

  const addEvent = useCallback((event: Omit<StudyEvent, 'id'>) => {
    const newEvent = store.addEvent(event);
    refresh();
    return newEvent;
  }, [refresh]);

  const updateEvent = useCallback((event: StudyEvent) => {
    store.updateEvent(event);
    refresh();
  }, [refresh]);

  const deleteEvent = useCallback((id: string) => {
    store.deleteEvent(id);
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    store.clearUserData();
    setUserData(null);
  }, []);

  return {
    userData,
    createUser,
    addCourse,
    updateCourse,
    deleteCourse,
    addEvent,
    updateEvent,
    deleteEvent,
    logout,
  };
}
