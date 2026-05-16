import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
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
  /** Compact mode shows fewer items + Visa mer. */
  compact?: boolean;
}

export default function RiskOverview({ courses, programName, startYear, compact = true }: RiskOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  const programTemplate = useMemo(
    () => (programName ? bthPrograms.find(p => p.name === programName) : null),
    [programName],
  );

  const { prereqMap, blocksMap } = useMemo(() => {
    const prereq = new Map<string, string[]>();
    const blocks = new Map<string, string[]>();
    if (programTemplate) {
      for (const c of programTemplate.courses) {
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
    return { prereqMap: prereq, blocksMap: blocks };
  }, [programTemplate]);

  const statusByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of courses) m.set(c.course_code, c.status);
    return m;
  }, [courses]);

  const estimate = startYear ? estimateStudyYear(startYear) : null;
  const currentStudyYear = estimate?.year ?? 1;

  const overdueCourses = courses.filter(
    c => c.year <= currentStudyYear && c.status !== 'completed',
  );

  const unmetPrereqCourses = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const prereqs = prereqMap.get(c.course_code) || [];
      const unmet = prereqs.filter(p => statusByCode.get(p) !== 'completed');
      return { course: c, unmet };
    })
    .filter(x => x.unmet.length > 0);

  const blockingNotDone = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const blocks = (blocksMap.get(c.course_code) || []).filter(b => statusByCode.get(b) !== 'completed');
      return { course: c, blocks };
    })
    .filter(x => x.blocks.length > 0);

  // Build a unified list of items (summary lines + per-course items)
  type Item = { key: string; text: React.ReactNode; priority: number };
  const items: Item[] = [];

  if (overdueCourses.length > 0) {
    items.push({
      key: 'sum-overdue',
      priority: 0,
      text: <>Du har <span className="font-semibold text-foreground">{overdueCourses.length}</span> kurser från tidigare/nuvarande år som inte är avklarade.</>,
    });
  }
  if (unmetPrereqCourses.length > 0) {
    items.push({
      key: 'sum-prereq',
      priority: 1,
      text: <><span className="font-semibold text-foreground">{unmetPrereqCourses.length}</span> kommande kurser har ej uppfyllda förkunskaper.</>,
    });
  }

  blockingNotDone.slice(0, 8).forEach(({ course, blocks }) => {
    items.push({
      key: `block-${course.course_code}`,
      priority: 2,
      text: <><span className="font-mono text-foreground">{course.course_code}</span> är inte avklarad och kan påverka kommande kurser ({blocks.slice(0, 3).map(b => (
        <span key={b} className="font-mono text-foreground">{b}</span>
      )).reduce<React.ReactNode[]>((acc, el, i) => { if (i > 0) acc.push(', '); acc.push(el); return acc; }, [])}{blocks.length > 3 ? ` +${blocks.length - 3}` : ''}).</>,
    });
  });

  unmetPrereqCourses.slice(0, 8).forEach(({ course, unmet }) => {
    items.push({
      key: `prereq-${course.course_code}`,
      priority: 3,
      text: <><span className="font-mono text-foreground">{course.course_code}</span> kräver {unmet.map(u => (
        <span key={u} className="font-mono text-foreground">{u}</span>
      )).reduce<React.ReactNode[]>((acc, el, i) => { if (i > 0) acc.push(', '); acc.push(el); return acc; }, [])}.</>,
    });
  });

  if (blockingNotDone.length > 0) {
    items.push({
      key: 'tip-block',
      priority: 4,
      text: <span className="text-muted-foreground">Tips: Prioritera moment i kurser som spärrar kommande kurser.</span>,
    });
  }

  items.sort((a, b) => a.priority - b.priority);

  const visibleLimit = compact && !expanded ? 4 : items.length;
  const visibleItems = items.slice(0, visibleLimit);
  const hasMore = items.length > visibleLimit;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-heading">
          <ShieldAlert className="h-5 w-5 text-warning" />
          Riskbild & rekommendationer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga risker upptäckta just nu. Bra jobbat!</p>
        ) : (
          <>
            <ul className="space-y-2">
              {visibleItems.map(item => (
                <li key={item.key} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            {compact && (hasMore || expanded) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-auto px-2 py-1 text-xs"
                onClick={() => setExpanded(e => !e)}
              >
                {expanded ? 'Visa färre' : `Visa mer (${items.length - visibleLimit})`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
