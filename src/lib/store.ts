import { UserData, Course, StudyEvent } from './types';

const STORAGE_KEY = 'bth-study-planner';

function generatePlanningId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `BTH-${year}-${suffix}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getUserData(): UserData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createUser(programName: string, courses: Omit<Course, 'id'>[]): UserData {
  const data: UserData = {
    planningId: generatePlanningId(),
    programName,
    courses: courses.map(c => ({ ...c, id: generateId() })),
    events: [],
    createdAt: new Date().toISOString(),
  };
  saveUserData(data);
  return data;
}

export function addCourse(course: Omit<Course, 'id'>): Course {
  const data = getUserData()!;
  const newCourse = { ...course, id: generateId() };
  data.courses.push(newCourse);
  saveUserData(data);
  return newCourse;
}

export function updateCourse(course: Course): void {
  const data = getUserData()!;
  data.courses = data.courses.map(c => c.id === course.id ? course : c);
  saveUserData(data);
}

export function deleteCourse(id: string): void {
  const data = getUserData()!;
  data.courses = data.courses.filter(c => c.id !== id);
  data.events = data.events.filter(e => e.courseId !== id);
  saveUserData(data);
}

export function addEvent(event: Omit<StudyEvent, 'id'>): StudyEvent {
  const data = getUserData()!;
  const newEvent = { ...event, id: generateId() };
  data.events.push(newEvent);
  saveUserData(data);
  return newEvent;
}

export function updateEvent(event: StudyEvent): void {
  const data = getUserData()!;
  data.events = data.events.map(e => e.id === event.id ? event : e);
  saveUserData(data);
}

export function deleteEvent(id: string): void {
  const data = getUserData()!;
  data.events = data.events.filter(e => e.id !== id);
  saveUserData(data);
}

export function clearUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
