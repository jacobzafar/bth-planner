import { describe, it, expect } from 'vitest';
import {
  resolveSubject,
  primarySubject,
  normalizeRequirements,
  evaluateRequirement,
  evaluateCourseRequirements,
  totalCompletedHp,
  completedHpInSubject,
} from './prerequisites';

describe('resolveSubject', () => {
  it('uses explicit huvudområde when present', () => {
    expect(resolveSubject('XX9999', 'Matematik').primary).toBe('Matematik');
  });
  it('strips sub-specialization after comma for primary', () => {
    const r = resolveSubject('DV1574', 'Datavetenskap, inriktning programvaruutveckling');
    expect(r.primary).toBe('Datavetenskap');
    expect(r.full).toBe('Datavetenskap, inriktning programvaruutveckling');
  });
  it('falls back to code prefix mapping', () => {
    expect(resolveSubject('MA1499').primary).toBe('Matematik');
    expect(resolveSubject('IY1418').primary).toBe('Industriell ekonomi och management');
    expect(resolveSubject('FY1436').primary).toBe('Fysik');
  });
  it('returns Okänt huvudområde for unknown prefixes', () => {
    expect(resolveSubject('ZZ9999').primary).toBe('Okänt huvudområde');
  });
});

describe('primarySubject', () => {
  it('returns null for empty', () => {
    expect(primarySubject(null)).toBeNull();
    expect(primarySubject('')).toBeNull();
  });
});

describe('normalizeRequirements', () => {
  it('converts legacy prerequisites to completed_course', () => {
    const reqs = normalizeRequirements({ code: 'X', prerequisites: ['A', 'B'] });
    expect(reqs).toEqual([
      { type: 'completed_course', courseCode: 'A' },
      { type: 'completed_course', courseCode: 'B' },
    ]);
  });
  it('treats code as attended when originalText mentions genomgången', () => {
    const reqs = normalizeRequirements({
      code: 'X',
      prerequisites: ['A', 'B'],
      originalRequirementsText: 'Avklarad A samt genomgången B',
    });
    expect(reqs[0]).toEqual({ type: 'completed_course', courseCode: 'A' });
    expect(reqs[1]).toEqual({ type: 'attended_course', courseCode: 'B' });
  });
  it('returns explicit requirements unchanged', () => {
    const reqs = normalizeRequirements({
      code: 'X',
      requirements: [{ type: 'completed_total_hp', hp: 75 }],
    });
    expect(reqs).toEqual([{ type: 'completed_total_hp', hp: 75 }]);
  });
});

describe('evaluateRequirement', () => {
  const ctx = {
    courses: [
      { course_code: 'A', status: 'completed', hp: 6 },
      { course_code: 'B', status: 'partly', hp: 6 },
      { course_code: 'C', status: 'not_started', hp: 6 },
      { course_code: 'D', status: 'completed', hp: 6, subject: 'Datavetenskap' },
    ],
    subtasks: [
      { course_code: 'C', completed: true, hp: 2 },
      { course_code: 'B', completed: true, hp: 3 },
    ],
  };

  it('completed_course requires completed status', () => {
    expect(evaluateRequirement({ type: 'completed_course', courseCode: 'A' }, ctx).fulfilled).toBe(true);
    expect(evaluateRequirement({ type: 'completed_course', courseCode: 'B' }, ctx).severity).toBe('soft');
    expect(evaluateRequirement({ type: 'completed_course', courseCode: 'C' }, ctx).severity).toBe('hard');
  });

  it('attended_course fulfilled by partly or completed', () => {
    expect(evaluateRequirement({ type: 'attended_course', courseCode: 'B' }, ctx).fulfilled).toBe(true);
    expect(evaluateRequirement({ type: 'attended_course', courseCode: 'C' }, ctx).fulfilled).toBe(false);
  });

  it('completed_hp_in_course sums subtask HP', () => {
    const r = evaluateRequirement({ type: 'completed_hp_in_course', courseCode: 'C', hp: 2 }, ctx);
    expect(r.fulfilled).toBe(true);
    expect(r.progress).toEqual({ current: 2, required: 2 });
  });
  it('completed_hp_in_course uses full HP when course completed', () => {
    const r = evaluateRequirement({ type: 'completed_hp_in_course', courseCode: 'A', hp: 6 }, ctx);
    expect(r.fulfilled).toBe(true);
  });

  it('completed_hp_in_subject uses explicit subject and avoids double counting', () => {
    expect(completedHpInSubject('Datavetenskap', ctx)).toBe(6);
    const r = evaluateRequirement({ type: 'completed_hp_in_subject', subject: 'Datavetenskap', hp: 6 }, ctx);
    expect(r.fulfilled).toBe(true);
  });

  it('completed_total_hp counts completed courses + completed subtasks', () => {
    // A(6) + D(6) completed = 12; C subtask 2 + B subtask 3 = 5 more; total 17
    expect(totalCompletedHp(ctx)).toBe(17);
    expect(evaluateRequirement({ type: 'completed_total_hp', hp: 15 }, ctx).fulfilled).toBe(true);
    expect(evaluateRequirement({ type: 'completed_total_hp', hp: 100 }, ctx).fulfilled).toBe(false);
  });

  it('custom_text is informational by default', () => {
    const r = evaluateRequirement({ type: 'custom_text', text: 'Se kursplan' }, ctx);
    expect(r.fulfilled).toBe(true);
    expect(r.message).toContain('Manuellt krav');
  });
  it('custom_text blocks when blocking flag is set', () => {
    const r = evaluateRequirement({ type: 'custom_text', text: 'X', blocking: true }, ctx);
    expect(r.fulfilled).toBe(false);
    expect(r.severity).toBe('hard');
  });
});

describe('evaluateCourseRequirements', () => {
  it('returns hardUnmet/softUnmet split for legacy course prereqs', () => {
    const result = evaluateCourseRequirements(
      { code: 'X', prerequisites: ['A', 'B', 'C'] },
      {
        courses: [
          { course_code: 'A', status: 'completed', hp: 6 },
          { course_code: 'B', status: 'partly', hp: 6 },
          { course_code: 'C', status: 'not_started', hp: 6 },
        ],
      },
    );
    expect(result.allMet).toBe(false);
    expect(result.hardUnmet).toHaveLength(1);
    expect(result.softUnmet).toHaveLength(1);
  });
});
