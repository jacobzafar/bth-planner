import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, ShieldAlert, BookOpen, Lock, Info, CalendarRange } from 'lucide-react';
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

  const { prereqMap, templateNameMap } = useMemo(() => {
    const prereq = new Map<string, string[]>();
    const names = new Map<string, string>();
    if (programTemplate) {
      for (const c of programTemplate.courses) {
        names.set(c.code, c.name);
        if (c.prerequisites && c.prerequisites.length) {
          prereq.set(c.code, c.prerequisites);
        }
      }
    }
    return { prereqMap: prereq, templateNameMap: names };
  }, [programTemplate]);

  const courseByCode = useMemo(() => {
    const m = new Map<string, CourseRow>();
    for (const c of courses) m.set(c.course_code, c);
    return m;
  }, [courses]);

  const nameOf = (code: string) =>
    courseByCode.get(code)?.course_name || templateNameMap.get(code);

  const yearOf = (code: string) =>
    courseByCode.get(code)?.year ?? programTemplate?.courses.find(c => c.code === code)?.year;

  const estimate = startYear ? estimateStudyYear(startYear) : null;
  const currentStudyYear = estimate?.year ?? 1;

  const overdueCourses = courses.filter(
    c => c.year <= currentStudyYear && c.status !== 'completed',
  );

  type PrereqKind = 'met' | 'soft' | 'hard';
  const prereqKind = (code: string): PrereqKind => {
    const s = courseByCode.get(code)?.status;
    if (s === 'completed') return 'met';
    if (s === 'partly') return 'soft';
    return 'hard';
  };

  type CourseAnalysis = {
    course: CourseRow;
    hardUnmet: string[];
    softUnmet: string[];
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

  const blockedCourses = analyses.filter(a => a.hardUnmet.length > 0);
  const upcomingMissing = analyses.filter(
    a => a.course.year > currentStudyYear && (a.hardUnmet.length > 0 || a.softUnmet.length > 0),
  );

  // Group recommendations by prerequisite course: which prereqs unlock the most/soonest courses.
  // The recommendation always points to the prerequisite course, never to the blocked course itself.
  type RecGroup = {
    prereq: string;
    kind: 'hard' | 'soft'; // hard = ej påbörjad, soft = delvis avklarad
    affects: { code: string; year: number }[];
    minYear: number;
  };
  const recsByPrereq = new Map<string, RecGroup>();
  for (const a of analyses) {
    if (a.course.status === 'completed') continue;
    const unmet: { code: string; kind: 'hard' | 'soft' }[] = [
      ...a.hardUnmet.map(p => ({ code: p, kind: 'hard' as const })),
      ...a.softUnmet.map(p => ({ code: p, kind: 'soft' as const })),
    ];
    for (const u of unmet) {
      const existing = recsByPrereq.get(u.code);
      const g: RecGroup = existing || { prereq: u.code, kind: u.kind, affects: [], minYear: Infinity };
      // Hard kind wins over soft if the same prereq is referenced from multiple courses
      if (u.kind === 'hard') g.kind = 'hard';
      g.affects.push({ code: a.course.course_code, year: a.course.year });
      if (a.course.year < g.minYear) g.minYear = a.course.year;
      recsByPrereq.set(u.code, g);
    }
  }
  const sortedRecs = Array.from(recsByPrereq.values()).sort((a, b) => {
    // Hard (ej påbörjad) prereqs come before soft (delvis avklarad)
    if (a.kind !== b.kind) return a.kind === 'hard' ? -1 : 1;
    if (a.minYear !== b.minYear) return a.minYear - b.minYear;
    return b.affects.length - a.affects.length;
  });

  type Rec = { key: string; text: string; helper: string };
  const recs: Rec[] = sortedRecs.slice(0, 3).map(g => {
    const focusLabel = fmtCourse(g.prereq, nameOf(g.prereq));
    const affectsShown = g.affects.slice(0, 3).map(a => fmtCourse(a.code, nameOf(a.code))).join(', ');
    const more = g.affects.length > 3 ? ` +${g.affects.length - 3}` : '';
    const verb = g.kind === 'hard' ? 'Fokusera på' : 'Slutför';
    return {
      key: `rec-${g.prereq}`,
      text: `${verb} ${focusLabel}`,
      helper: `Behövs för ${affectsShown}${more}`,
    };
  });

  const sortedBlocked = [...blockedCourses].sort(
    (a, b) => a.course.year - b.course.year || b.hardUnmet.length - a.hardUnmet.length,
  );

  const blockedList = sortedBlocked.map(a => {
    const blocked = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
    const items = a.hardUnmet.slice(0, 3).map(p => fmtCourse(p, nameOf(p))).join(', ');
    const more = a.hardUnmet.length > 3 ? ` +${a.hardUnmet.length - 3}` : '';
    return {
      key: `b-${a.course.course_code}`,
      text: `${blocked} (år ${a.course.year}) – kräver ${items}${more}`,
    };
  });

  const upcomingList = upcomingMissing
    .filter(a => !blockedCourses.some(b => b.course.course_code === a.course.course_code))
    .sort((a, b) => a.course.year - b.course.year)
    .map(a => {
      const courseLabel = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
      const missing = [...a.hardUnmet, ...a.softUnmet];
      const items = missing.slice(0, 3).map(p => fmtCourse(p, nameOf(p))).join(', ');
      const more = missing.length > 3 ? ` +${missing.length - 3}` : '';
      return {
        key: `u-${a.course.course_code}`,
        text: `${courseLabel} – år ${a.course.year} – kräver ${items}${more}`,
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
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 font-heading">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Riskbild & rekommendationer
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Så beräknas riskbilden"
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="w-72 text-sm">
                Riskbilden baseras på ditt program, startår, kursstatus och förkunskapskrav.
                Kurser som är delvis avklarade räknas som påbörjade och visas därför som lägre
                risk än kurser som inte är påbörjade.
              </PopoverContent>
            </Popover>
          </CardTitle>
          {estimate && !estimate.uncertain && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
              <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
              År {estimate.year}, termin {estimate.semester} ({estimate.semester === 1 ? 'HT' : 'VT'})
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {noRisks ? (
          <p className="text-sm text-muted-foreground">Inga risker upptäckta just nu. Bra jobbat!</p>
        ) : (
          <>
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
