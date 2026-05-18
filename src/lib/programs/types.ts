import type { CourseRequirement } from '../prerequisites';

export interface ProgramCourse {
  name: string;
  code: string;
  hp: number;
  year: number;
  semester: 'HT' | 'VT';
  /** Course codes that are prerequisites for this course (legacy: treated as completed_course). */
  prerequisites?: string[];
  /** Typed prerequisite requirements (new model). Overrides legacy `prerequisites` when present. */
  requirements?: CourseRequirement[];
  /** Original requirement text from the course plan, e.g. "Avklarad MA1499 samt genomgången MA1500". */
  originalRequirementsText?: string;
  /** "Huvudområde" / subject area for the course. May contain a comma with sub-specialization. */
  subject?: string;
}

export interface ProgramTemplate {
  name: string;
  courses: ProgramCourse[];
}
