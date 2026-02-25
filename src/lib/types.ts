export type EventType = 'assignment' | 'lab' | 'exam';
export type EventStatus = 'upcoming' | 'complete' | 'overdue';
export type CourseImportance = 'high' | 'medium' | 'low';

export interface Course {
  id: string;
  name: string;
  code: string;
  blocking: boolean;
  importance: CourseImportance;
}

export interface StudyEvent {
  id: string;
  title: string;
  courseId: string;
  type: EventType;
  dueDate: string; // ISO date
  dueTime: string; // HH:mm
  description: string;
  status: EventStatus;
}

export interface UserData {
  planningId: string;
  programName: string;
  courses: Course[];
  events: StudyEvent[];
  createdAt: string;
}

export interface PrioritizedEvent extends StudyEvent {
  priority: number;
  explanation: string;
  course?: Course;
}

export interface ProgramTemplate {
  name: string;
  courses: Omit<Course, 'id'>[];
}
