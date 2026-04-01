export interface ProgramCourse {
  name: string;
  code: string;
  hp: number;
  year: number;
  semester: 'HT' | 'VT';
}

export interface ProgramTemplate {
  name: string;
  courses: ProgramCourse[];
}
