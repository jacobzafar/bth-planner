/**
 * Helpers for estimating where a student is in their studies based on
 * their selected start year. Swedish academic year starts roughly in
 * late August (HT). We treat July as the cutoff for a new academic year.
 */

export interface StudyYearEstimate {
  /** Estimated study year (1-based). May exceed program length. */
  year: number;
  /** Estimated semester within the year: 1 = HT (autumn), 2 = VT (spring). */
  semester: 1 | 2;
  /** True when the estimation is rough (e.g. before program start or after end). */
  uncertain: boolean;
  /** Human-readable Swedish label, e.g. "År 2, termin 1 (HT)". */
  label: string;
}

export function estimateStudyYear(startYear: number, now: Date = new Date()): StudyYearEstimate {
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Academic year (HT start). If we're in Jan-Jul, we're still in the academic year that started last calendar year.
  const academicYearStart = month >= 8 ? year : year - 1;
  const rawStudyYear = academicYearStart - startYear + 1;

  // Semester: Aug-Dec = HT (1), Jan-Jul = VT (2)
  const semester: 1 | 2 = month >= 8 ? 1 : 2;

  const studyYear = Math.max(1, rawStudyYear);
  const uncertain = rawStudyYear < 1 || rawStudyYear > 5;

  const termLabel = semester === 1 ? 'HT' : 'VT';
  const label = uncertain
    ? `Baserat på ditt startår ${startYear}`
    : `År ${studyYear}, termin ${semester} (${termLabel})`;

  return { year: studyYear, semester, uncertain, label };
}
