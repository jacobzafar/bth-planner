import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculatePriority, getPrioritizedEvents } from './prioritization';
import type { StudyEvent, Course } from './types';

const FIXED_NOW = new Date('2026-05-11T10:00:00Z');

const makeEvent = (overrides: Partial<StudyEvent> = {}): StudyEvent => ({
  id: overrides.id ?? 'e1',
  title: 'Event',
  courseId: 'c1',
  type: 'assignment',
  dueDate: '2026-05-12',
  dueTime: '10:00',
  description: '',
  status: 'upcoming',
  ...overrides,
});

const makeCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'c1',
  name: 'Course',
  code: 'X',
  blocking: false,
  importance: 'medium',
  ...overrides,
});

describe('calculatePriority', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('assigns highest score when due within 24h', () => {
    const r = calculatePriority(makeEvent({ dueDate: '2026-05-11', dueTime: '20:00' }));
    expect(r.priority).toBeGreaterThanOrEqual(10);
  });

  it('adds boost for blocking course and high importance', () => {
    const baseline = calculatePriority(makeEvent());
    const boosted = calculatePriority(
      makeEvent(),
      makeCourse({ blocking: true, importance: 'high' }),
    );
    expect(boosted.priority).toBe(baseline.priority + 4 + 2);
  });

  it('exam scores higher than assignment for same timing', () => {
    const exam = calculatePriority(makeEvent({ type: 'exam' }));
    const assignment = calculatePriority(makeEvent({ type: 'assignment' }));
    expect(exam.priority).toBeGreaterThan(assignment.priority);
  });
});

describe('getPrioritizedEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('filters out completed and past events', () => {
    const events: StudyEvent[] = [
      makeEvent({ id: 'past', dueDate: '2026-05-01' }),
      makeEvent({ id: 'done', status: 'complete' }),
      makeEvent({ id: 'keep', dueDate: '2026-05-15' }),
    ];
    const result = getPrioritizedEvents(events, []);
    expect(result.map(e => e.id)).toEqual(['keep']);
  });

  it('sorts by priority desc, then date asc', () => {
    const events: StudyEvent[] = [
      makeEvent({ id: 'far', dueDate: '2026-06-30', type: 'assignment' }),
      makeEvent({ id: 'soon-exam', dueDate: '2026-05-12', type: 'exam' }),
      makeEvent({ id: 'soon-assign', dueDate: '2026-05-12', type: 'assignment' }),
    ];
    const result = getPrioritizedEvents(events, []);
    expect(result[0].id).toBe('soon-exam');
    expect(result[result.length - 1].id).toBe('far');
  });
});
