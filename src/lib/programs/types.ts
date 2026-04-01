export interface ProgramCourse {
  name: string;
  code: string;
  hp: number;
  year: number;
  semester: 'HT' | 'VT';
  /** Course codes that are prerequisites for this course */
  prerequisites?: string[];
}

export interface ProgramTemplate {
  name: string;
  courses: ProgramCourse[];
}
