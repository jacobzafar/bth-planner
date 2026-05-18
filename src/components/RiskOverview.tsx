import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, BookOpen, Lock, Info, Sparkles } from 'lucide-react';
import { bthPrograms } from '@/lib/programs';
import { estimateStudyYear } from '@/lib/studyYear';
import { COURSE_STATUS_LABEL } from '@/lib/events';

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
  upcomingEventsCount?: number;
  unfinishedSubtasksCount?: number;
}

const MAX_NAME_LEN = 32;

function fmtCourse(code: string, name?: string) {
  if (!name) return code;
  if (name.length <= MAX_NAME_LEN) return `${name} (${code})`;
  return `${code} – ${name.slice(0, MAX_NAME_LEN).trim()}…`;
}

export default function RiskOverview({
  courses, programName, startYear, compact = true,
  upcomingEventsCount = 0, unfinishedSubtasksCount = 0,
}: RiskOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [metric, setMetric] = useState<null | 'overdue' | 'missing' | 'blocked'>(null);

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

  const estimate = startYear ? estimateStudyYear(startYear) : null;
  const currentStudyYear = estimate?.year ?? 1;

  const overdueCourses = courses.filter(
    c => c.year <= currentStudyYear && c.status !== 'completed',
  );

  const partlyCourses = courses.filter(c => c.status === 'partly');

  type PrereqKind = 'met' | 'soft' | 'hard';
  const prereqKind = (code: string): PrereqKind => {
    const s = courseByCode.get(code)?.status;
    if (s === 'completed') return 'met';
    if (s === 'partly') return 'soft';
    return 'hard'; // not_started OR not in user's plan at all
  };

  type CourseAnalysis = {
    course: CourseRow;
    hardUnmet: string[]; // prereq not started
    softUnmet: string[]; // prereq partly
  };

  // Only "Ej påbörjad" (not_started) courses can be considered "blocked"
  // by missing prerequisites. Partly-completed courses are treated as already
  // started and never appear as blocking risks.
  const notStartedAnalyses: CourseAnalysis[] = courses
    .filter(c => c.status !== 'completed' && c.status !== 'partly')
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

  // A course is "blocked" if it is not started AND has at least one hard (not started) prereq.
  const blockedCourses = notStartedAnalyses.filter(a => a.hardUnmet.length > 0);

  // Upcoming (future-year) not started courses with any unmet prereq (hard or soft)
  const upcomingMissing = notStartedAnalyses.filter(
    a => a.course.year > currentStudyYear && (a.hardUnmet.length > 0 || a.softUnmet.length > 0),
  );

  // Build recommendations grouped by prereq. Severity per prereq is "hard" if
  // at least one dependent course lists it as a hard prereq, else "soft".
  type RecGroup = {
    prereq: string;
    severity: 'hard' | 'soft';
    affects: { code: string; year: number }[];
    minYear: number;
  };
  const recsByPrereq = new Map<string, RecGroup>();
  for (const a of notStartedAnalyses) {
    const addPrereq = (p: string, isHard: boolean) => {
      const g = recsByPrereq.get(p) || {
        prereq: p, severity: 'soft' as 'hard' | 'soft', affects: [], minYear: Infinity,
      };
      if (isHard) g.severity = 'hard';
      if (!g.affects.some(x => x.code === a.course.course_code)) {
        g.affects.push({ code: a.course.course_code, year: a.course.year });
      }
      if (a.course.year < g.minYear) g.minYear = a.course.year;
      recsByPrereq.set(p, g);
    };
    for (const p of a.hardUnmet) addPrereq(p, true);
    for (const p of a.softUnmet) addPrereq(p, false);
  }
  const sortedRecs = Array.from(recsByPrereq.values()).sort((a, b) => {
    // hard before soft, then earliest blocked year, then most affected
    if (a.severity !== b.severity) return a.severity === 'hard' ? -1 : 1;
    if (a.minYear !== b.minYear) return a.minYear - b.minYear;
    return b.affects.length - a.affects.length;
  });

  type Rec = { key: string; text: string; helper: string };
  const blockingRecs: Rec[] = sortedRecs.slice(0, 3).map(g => {
    const focusLabel = fmtCourse(g.prereq, nameOf(g.prereq));
    const affectsShown = g.affects.slice(0, 3).map(a => fmtCourse(a.code, nameOf(a.code))).join(', ');
    const more = g.affects.length > 3 ? ` +${g.affects.length - 3}` : '';
    const verb = g.severity === 'hard' ? 'Fokusera på' : 'Slutför';
    return {
      key: `rec-${g.prereq}`,
      text: `${verb} ${focusLabel}`,
      helper: `Behövs för ${affectsShown}${more}`,
    };
  });

  // Fallback recommendations when there are no hard blocks pulling focus.
  const fallbackRecs: Rec[] = [];
  if (blockingRecs.length === 0) {
    if (partlyCourses.length > 0) {
      const sample = partlyCourses
        .slice(0, 3)
        .map(c => fmtCourse(c.course_code, c.course_name))
        .join(', ');
      const more = partlyCourses.length > 3 ? ` +${partlyCourses.length - 3}` : '';
      fallbackRecs.push({
        key: 'fb-active',
        text: 'Fokusera på aktiva kurser',
        helper: `Du har kurser som är delvis avklarade och bör slutföras: ${sample}${more}.`,
      });
    }
    const oldOverdue = overdueCourses.filter(c => c.year < currentStudyYear);
    if (oldOverdue.length > 0) {
      const sample = oldOverdue
        .slice(0, 3)
        .map(c => fmtCourse(c.course_code, c.course_name))
        .join(', ');
      const more = oldOverdue.length > 3 ? ` +${oldOverdue.length - 3}` : '';
      fallbackRecs.push({
        key: 'fb-retake',
        text: 'Planera omtentor eller kompletteringar',
        helper: `Du har kurser från tidigare år som inte är avklarade: ${sample}${more}.`,
      });
    }
    if (upcomingEventsCount > 0) {
      fallbackRecs.push({
        key: 'fb-deadlines',
        text: 'Fortsätt med kommande deadlines',
        helper: 'Inga akuta spärrar hittades just nu. Se "Fokusera härnäst" för nästa steg.',
      });
    } else if (unfinishedSubtasksCount > 0) {
      fallbackRecs.push({
        key: 'fb-subtasks',
        text: 'Slutför påbörjade kursmoment',
        helper: `Du har ${unfinishedSubtasksCount} oavklarade kursmoment att jobba vidare med.`,
      });
    }
    if (fallbackRecs.length === 0) {
      fallbackRecs.push({
        key: 'fb-allgood',
        text: 'Inga akuta spärrar hittades just nu',
        helper: 'Fortsätt följa dina kommande deadlines och aktiva kurser.',
      });
    }
  }

  const recs: Rec[] = blockingRecs.length > 0 ? blockingRecs : fallbackRecs;

  const sortedBlocked = [...blockedCourses].sort(
    (a, b) => a.course.year - b.course.year || b.hardUnmet.length - a.hardUnmet.length,
  );

  const blockedList = sortedBlocked.map(a => {
    const blocked = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
    const items = a.hardUnmet.slice(0, 3).map(p => fmtCourse(p, nameOf(p))).join(', ');
    const more = a.hardUnmet.length > 3 ? ` +${a.hardUnmet.length - 3}` : '';
    return {
      key: `b-${a.course.course_code}`,
      text: `${blocked} (år ${a.course.year}) – kräver avklarad kurs: ${items}${more}`,
    };
  });

  const upcomingList = upcomingMissing
    .filter(a => !blockedCourses.some(b => b.course.course_code === a.course.course_code))
    .sort((a, b) => a.course.year - b.course.year)
    .map(a => {
      const courseLabel = fmtCourse(a.course.course_code, nameOf(a.course.course_code));
      const hard = a.hardUnmet.map(p => fmtCourse(p, nameOf(p)));
      const soft = a.softUnmet.map(p => fmtCourse(p, nameOf(p)));
      const parts: string[] = [];
      if (hard.length) parts.push(`avklarad kurs: ${hard.slice(0, 3).join(', ')}${hard.length > 3 ? ` +${hard.length - 3}` : ''}`);
      if (soft.length) parts.push(`genomgången/påbörjad kurs: ${soft.slice(0, 3).join(', ')}${soft.length > 3 ? ` +${soft.length - 3}` : ''}`);
      return {
        key: `u-${a.course.course_code}`,
        text: `${courseLabel} – år ${a.course.year} – kräver ${parts.join(' · ')}`,
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
  const showingFallback = blockingRecs.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        
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
              Kurser som är påbörjade räknas inte som spärrade, även om någon förkunskap inte är helt klar.
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MetricCard
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            label="Ej avklarade kurser"
            value={overdueCourses.length}
            onClick={() => setMetric('overdue')}
          />
          <MetricCard
            icon={<AlertTriangle className="h-4 w-4 text-warning" />}
            label="Saknade förkunskaper"
            value={upcomingMissing.length}
            emphasize={upcomingMissing.length > 0}
            onClick={() => setMetric('missing')}
          />
          <MetricCard
            icon={<Lock className="h-4 w-4 text-destructive" />}
            label="Spärrade kurser"
            value={blockedCourses.length}
            emphasize={blockedCourses.length > 0}
            onClick={() => setMetric('blocked')}
          />
        </div>

        {noRisks ? (
          <p className="text-sm text-muted-foreground">Inga risker upptäckta just nu. Bra jobbat!</p>
        ) : (
          <>
            {recs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Rekommenderat just nu
                </p>
                <ul className="space-y-2">
                  {recs.map(t => (
                    <li key={t.key} className="flex items-start gap-2">
                      {showingFallback ? (
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium leading-snug">{t.text}</p>
                        <p className="text-xs text-muted-foreground">{t.helper}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {compact && totalDetails > 0 && (
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

      <Dialog open={metric !== null} onOpenChange={(o) => { if (!o) setMetric(null); }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {metric === 'overdue' && 'Ej avklarade kurser'}
              {metric === 'missing' && 'Saknade förkunskaper'}
              {metric === 'blocked' && 'Spärrade kurser'}
            </DialogTitle>
          </DialogHeader>

          {metric === 'overdue' && (
            overdueCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga ej avklarade kurser från tidigare eller nuvarande år.</p>
            ) : (
              <ul className="space-y-2">
                {overdueCourses.map(c => (
                  <li key={c.course_code} className="rounded-md border p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground">{c.course_code}</span>
                      <Badge variant="outline" className="text-xs">År {c.year}</Badge>
                      <Badge variant="secondary" className="text-xs">{COURSE_STATUS_LABEL[c.status] || c.status}</Badge>
                    </div>
                    {c.course_name && <p className="text-sm text-muted-foreground mt-1">{c.course_name}</p>}
                  </li>
                ))}
              </ul>
            )
          )}

          {metric === 'missing' && (
            upcomingMissing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga saknade förkunskaper hittades just nu.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingMissing.map(a => {
                  const missing = [...a.hardUnmet, ...a.softUnmet];
                  return (
                    <li key={a.course.course_code} className="rounded-md border p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-foreground">{a.course.course_code}</span>
                        <Badge variant="outline" className="text-xs">År {a.course.year}</Badge>
                      </div>
                      {nameOf(a.course.course_code) && (
                        <p className="text-sm text-muted-foreground mt-1">{nameOf(a.course.course_code)}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 mb-1">Saknade förkunskaper:</p>
                      <ul className="space-y-1">
                        {missing.map(p => {
                          const k = prereqKind(p);
                          const statusLabel = k === 'soft' ? 'Påbörjad' : 'Ej påbörjad';
                          return (
                            <li key={p} className="flex items-center gap-2 text-sm">
                              <span className="font-mono font-semibold">{p}</span>
                              {nameOf(p) && <span className="text-muted-foreground truncate">{nameOf(p)}</span>}
                              <Badge variant={k === 'soft' ? 'secondary' : 'outline'} className="text-xs ml-auto">{statusLabel}</Badge>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )
          )}

          {metric === 'blocked' && (
            blockedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga spärrade kurser hittades just nu.</p>
            ) : (
              <ul className="space-y-2">
                {blockedCourses.map(a => (
                  <li key={a.course.course_code} className="rounded-md border p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground">{a.course.course_code}</span>
                      <Badge variant="outline" className="text-xs">År {a.course.year}</Badge>
                      <Badge variant="destructive" className="text-xs">Spärrad</Badge>
                    </div>
                    {nameOf(a.course.course_code) && (
                      <p className="text-sm text-muted-foreground mt-1">{nameOf(a.course.course_code)}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Kräver att följande förkunskap(er) startas eller avklaras:
                    </p>
                    <ul className="mt-1 space-y-1">
                      {a.hardUnmet.map(p => (
                        <li key={p} className="flex items-center gap-2 text-sm">
                          <span className="font-mono font-semibold">{p}</span>
                          {nameOf(p) && <span className="text-muted-foreground truncate">{nameOf(p)}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function MetricCard({
  icon, label, value, emphasize, onClick,
}: { icon: React.ReactNode; label: string; value: number; emphasize?: boolean; onClick?: () => void }) {
  const className = `text-left w-full rounded-lg border p-2.5 sm:p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
    emphasize ? 'border-warning/40 bg-warning/5 hover:bg-warning/10' : 'border-border bg-muted/30 hover:bg-muted/50'
  }`;
  return (
    <button type="button" onClick={onClick} className={className}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground leading-none">{value}</p>
    </button>
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
