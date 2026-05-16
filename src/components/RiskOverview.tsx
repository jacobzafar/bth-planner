import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, BookOpen, Lock } from 'lucide-react';
import { bthPrograms } from '@/lib/programs';
import { estimateStudyYear } from '@/lib/studyYear';

interface CourseRow {
  course_code: string;
  course_name?: string;
  year: number;
  status: string;
}

interface RiskOverviewProps {
  courses: CourseRow[];
  programName: string | null;
  startYear: number | null;
  compact?: boolean;
}

const MAX_NAME_LEN = 32;

function fmtCourse(code: string, name?: string) {
  if (!name) return code;
  if (name.length <= MAX_NAME_LEN) return `${name} (${code})`;
  return `${code} – ${name.slice(0, MAX_NAME_LEN).trim()}…`;
}

export default function RiskOverview({ courses, programName, startYear, compact = true }: RiskOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  const programTemplate = useMemo(
    () => (programName ? bthPrograms.find(p => p.name === programName) : null),
    [programName],
  );

  const { prereqMap, blocksMap, templateNameMap } = useMemo(() => {
    const prereq = new Map<string, string[]>();
    const blocks = new Map<string, string[]>();
    const names = new Map<string, string>();
    if (programTemplate) {
      for (const c of programTemplate.courses) {
        names.set(c.code, c.name);
        if (c.prerequisites && c.prerequisites.length) {
          prereq.set(c.code, c.prerequisites);
          for (const p of c.prerequisites) {
            const arr = blocks.get(p) || [];
            arr.push(c.code);
            blocks.set(p, arr);
          }
        }
      }
    }
    return { prereqMap: prereq, blocksMap: blocks, templateNameMap: names };
  }, [programTemplate]);

  const courseByCode = useMemo(() => {
    const m = new Map<string, CourseRow>();
    for (const c of courses) m.set(c.course_code, c);
    return m;
  }, [courses]);

  const nameOf = (code: string) =>
    courseByCode.get(code)?.course_name || templateNameMap.get(code);

  const estimate = startYear ? estimateStudyYear(startYear) : null;
  const currentStudyYear = estimate?.year ?? 1;

  // "Ej avklarade kurser" – courses from previous/current years not completed
  const overdueCourses = courses.filter(
    c => c.year <= currentStudyYear && c.status !== 'completed',
  );

  // Helper: classify a prereq's fulfillment
  // completed → met; partly → soft (started but not done); not_started/missing → hard block
  type PrereqKind = 'met' | 'soft' | 'hard';
  const prereqKind = (code: string): PrereqKind => {
    const s = courseByCode.get(code)?.status;
    if (s === 'completed') return 'met';
    if (s === 'partly') return 'soft';
    return 'hard';
  };

  type CourseAnalysis = {
    course: CourseRow;
    hardUnmet: string[]; // prereqs that are not_started/missing
    softUnmet: string[]; // prereqs that are partly
  };

  const analyses: CourseAnalysis[] = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const prereqs = prereqMap.get(c.course_code) || [];
      const hardUnmet: string[] = [];
      const softUnmet: string[] = [];
      for (const p of prereqs) {
        const k = prereqKind(p);
        if (k === 'hard') hardUnmet.push(p);
        else if (k === 'soft') softUnmet.push(p);
      }
      return { course: c, hardUnmet, softUnmet };
    });

  // "Spärrade kurser" – courses with at least one hard-unmet prereq (cannot fully start)
  const blockedCourses = analyses.filter(a => a.hardUnmet.length > 0);

  // "Saknade förkunskaper" – upcoming courses (future years) with any unmet prereq (hard or soft)
  const upcomingMissing = analyses.filter(
    a => a.course.year > currentStudyYear && (a.hardUnmet.length > 0 || a.softUnmet.length > 0),
  );

  // Priority score for blocked items (lower year = higher priority)
  const priorityScore = (a: CourseAnalysis) => {
    const diff = a.course.year - currentStudyYear; // negative = overdue
    // Heavy weight for overdue/current, plus hard count
    const base = diff <= 0 ? 0 : diff; // 0 for past/current, increases for future
    return base * 10 - a.hardUnmet.length;
  };

  const sortedBlocked = [...blockedCourses].sort((a, b) => priorityScore(a) - priorityScore(b));

  // Build top recommendations (2-3 actionable items)
  type Rec = { key: string; text: string; helper: string };
  const recs: Rec[] = [];

  for (const a of sortedBlocked) {
    if (recs.length >= 3) break;
    const blocked = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
    const firstPrereq = a.hardUnmet[0];
    const prereqLabel = fmtCourse(firstPrereq, nameOf(firstPrereq));
    const more = a.hardUnmet.length > 1 ? ` (+${a.hardUnmet.length - 1})` : '';
    const isSoon = a.course.year <= currentStudyYear;
    recs.push({
      key: `rec-block-${a.course.course_code}`,
      text: `Börja med ${prereqLabel}${more} eftersom den krävs för ${blocked}`,
      helper: isSoon
        ? 'Den här spärren påverkar en kurs du borde läsa nu'
        : 'Prioritera att nå förkunskapskraven',
    });
  }

  if (recs.length < 3) {
    const sortedUpcoming = [...upcomingMissing].sort((a, b) => a.course.year - b.course.year);
    for (const a of sortedUpcoming) {
      if (recs.length >= 3) break;
      if (recs.some(r => r.key.endsWith(a.course.course_code))) continue;
      const courseLabel = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
      const missing = [...a.hardUnmet, ...a.softUnmet];
      const first = missing[0];
      const more = missing.length > 1 ? ` (+${missing.length - 1})` : '';
      recs.push({
        key: `rec-up-${a.course.course_code}`,
        text: `${courseLabel} kräver ${fmtCourse(first, nameOf(first))}${more}`,
        helper: 'Kommande kurs med saknade förkunskaper',
      });
    }
  }

  // Grouped expanded lists
  const blockedList = sortedBlocked.map(a => {
    const blocked = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
    const items = a.hardUnmet.slice(0, 3).map(p => fmtCourse(p, nameOf(p))).join(', ');
    const more = a.hardUnmet.length > 3 ? ` +${a.hardUnmet.length - 3}` : '';
    return {
      key: `b-${a.course.course_code}`,
      text: `${blocked} – kräver ${items}${more}`,
    };
  });

  const upcomingList = upcomingMissing
    .filter(a => !blockedCourses.some(b => b.course.course_code === a.course.course_code))
    .map(a => {
      const courseLabel = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
      const missing = [...a.hardUnmet, ...a.softUnmet];
      const items = missing.slice(0, 3).map(p => fmtCourse(p, nameOf(p))).join(', ');
      const more = missing.length > 3 ? ` +${missing.length - 3}` : '';
      return {
        key: `u-${a.course.course_code}`,
        text: `${courseLabel} – kräver ${items}${more}`,
      };
    });

  const blockedCodes = new Set(blockedCourses.map(a => a.course.course_code));
  const upcomingCodes = new Set(upcomingMissing.map(a => a.course.course_code));
  const overdueList = overdueCourses
    .filter(c => !blockedCodes.has(c.course_code) && !upcomingCodes.has(c.course_code))
    .map(c => ({
      key: `o-${c.course_code}`,
      text: `${fmtCourse(c.course_code, c.course_name)} – inte avklarad från år ${c.year}`,
    }));

  const noRisks =
    overdueCourses.length === 0 &&
    upcomingMissing.length === 0 &&
    blockedCourses.length === 0;

  const totalDetails = blockedList.length + upcomingList.length + overdueList.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading">
          <ShieldAlert className="h-5 w-5 text-warning" />
          Riskbild & rekommendationer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {noRisks ? (
          <p className="text-sm text-muted-foreground">Inga risker upptäckta just nu. Bra jobbat!</p>
        ) : (
          <>
            {/* Summary metric cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <MetricCard
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                label="Ej avklarade kurser"
                value={overdueCourses.length}
              />
              <MetricCard
                icon={<AlertTriangle className="h-4 w-4 text-warning" />}
                label="Saknade förkunskaper"
                value={upcomingMissing.length}
                emphasize={upcomingMissing.length > 0}
              />
              <MetricCard
                icon={<Lock className="h-4 w-4 text-destructive" />}
                label="Spärrade kurser"
                value={blockedCourses.length}
                emphasize={blockedCourses.length > 0}
              />
            </div>

            {/* Top recommendations */}
            {recs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Rekommenderat just nu
                </p>
                <ul className="space-y-2">
                  {recs.map(t => (
                    <li key={t.key} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium leading-snug">{t.text}</p>
                        <p className="text-xs text-muted-foreground">{t.helper}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expandable grouped details */}
            {compact && totalDetails > recs.length && (
              <>
                {expanded && (
                  <div className="space-y-3 pt-1">
                    {blockedList.length > 0 && (
                      <Group title="Spärrade kurser" items={blockedList} dotClass="bg-destructive" />
                    )}
                    {upcomingList.length > 0 && (
                      <Group
                        title="Kommande kurser med saknade förkunskaper"
                        items={upcomingList}
                        dotClass="bg-warning"
                      />
                    )}
                    {overdueList.length > 0 && (
                      <Group
                        title="Ej avklarade kurser från tidigare/nuvarande år"
                        items={overdueList}
                        dotClass="bg-muted-foreground"
                      />
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => setExpanded(e => !e)}
                >
                  {expanded ? 'Visa färre' : 'Visa mer'}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon, label, value, emphasize,
}: { icon: React.ReactNode; label: string; value: number; emphasize?: boolean }) {
  return (
    <div className={`rounded-lg border p-2.5 sm:p-3 ${emphasize ? 'border-warning/40 bg-warning/5' : 'border-border bg-muted/30'}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground leading-none">{value}</p>
    </div>
  );
}

function Group({ title, items, dotClass }: { title: string; items: { key: string; text: string }[]; dotClass: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{title}</p>
      <ul className="space-y-1.5">
        {items.map(i => (
          <li key={i.key} className="flex items-start gap-2 text-sm text-foreground">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />
            <span>{i.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
