import { describe, it, expect } from 'vitest';

// Mirrors HP/status aggregation logic in Dashboard.tsx and CourseStatusPage.tsx
type CourseLike = { status: string; hp: number; year: number };

function computeHpTotals(courses: CourseLike[], totalProgramHp?: number) {
  const completedHp = courses
    .filter(c => c.status === 'completed')
    .reduce((s, c) => s + c.hp, 0);
  const partlyHp = courses
    .filter(c => c.status === 'partly')
    .reduce((s, c) => s + c.hp, 0);
  const totalHp = totalProgramHp ?? courses.reduce((s, c) => s + c.hp, 0);
  const progressPercent = totalHp > 0 ? Math.round((completedHp / totalHp) * 100) : 0;
  return { completedHp, partlyHp, totalHp, progressPercent };
}

function groupHpByYear(courses: CourseLike[]) {
  const years = [...new Set(courses.map(c => c.year))].sort((a, b) => a - b);
  return years.map(year => {
    const yearCourses = courses.filter(c => c.year === year);
    return {
      year,
      completed: yearCourses
        .filter(c => c.status === 'completed')
        .reduce((s, c) => s + c.hp, 0),
      total: yearCourses.reduce((s, c) => s + c.hp, 0),
    };
  });
}

// Mirrors subtask -> course completion behavior:
// when all subtasks of a course are completed, the course is fully done.
type Subtask = { courseId: string; completed: boolean; hp: number };

function deriveCourseStatus(subtasks: Subtask[], courseId: string): 'completed' | 'partly' | 'not_started' {
  const own = subtasks.filter(s => s.courseId === courseId);
  if (own.length === 0) return 'not_started';
  const done = own.filter(s => s.completed).length;
  if (done === 0) return 'not_started';
  if (done === own.length) return 'completed';
  return 'partly';
}

describe('HP totals', () => {
  it('sums completed and partly HP correctly', () => {
    const courses: CourseLike[] = [
      { status: 'completed', hp: 7.5, year: 1 },
      { status: 'completed', hp: 7.5, year: 1 },
      { status: 'partly', hp: 6, year: 2 },
      { status: 'not_started', hp: 7.5, year: 2 },
    ];
    const r = computeHpTotals(courses);
    expect(r.completedHp).toBe(15);
    expect(r.partlyHp).toBe(6);
    expect(r.totalHp).toBe(28.5);
    expect(r.progressPercent).toBe(53);
  });

  it('uses totalProgramHp override when provided', () => {
    const courses: CourseLike[] = [{ status: 'completed', hp: 30, year: 1 }];
    const r = computeHpTotals(courses, 300);
    expect(r.totalHp).toBe(300);
    expect(r.progressPercent).toBe(10);
  });

  it('handles empty course list without dividing by zero', () => {
    const r = computeHpTotals([]);
    expect(r.progressPercent).toBe(0);
    expect(r.totalHp).toBe(0);
  });
});

describe('groupHpByYear', () => {
  it('groups and sorts years numerically', () => {
    const courses: CourseLike[] = [
      { status: 'completed', hp: 7.5, year: 2 },
      { status: 'partly', hp: 7.5, year: 10 },
      { status: 'completed', hp: 7.5, year: 1 },
    ];
    const groups = groupHpByYear(courses);
    expect(groups.map(g => g.year)).toEqual([1, 2, 10]);
    expect(groups[0].completed).toBe(7.5);
    expect(groups[1].total).toBe(7.5);
  });
});

describe('deriveCourseStatus from subtasks', () => {
  const subtasks: Subtask[] = [
    { courseId: 'a', completed: true, hp: 3 },
    { courseId: 'a', completed: true, hp: 3 },
    { courseId: 'b', completed: true, hp: 3 },
    { courseId: 'b', completed: false, hp: 3 },
  ];

  it('returns completed when all subtasks done', () => {
    expect(deriveCourseStatus(subtasks, 'a')).toBe('completed');
  });

  it('returns partly when some subtasks done', () => {
    expect(deriveCourseStatus(subtasks, 'b')).toBe('partly');
  });

  it('returns not_started when no subtasks exist', () => {
    expect(deriveCourseStatus(subtasks, 'missing')).toBe('not_started');
  });
});
