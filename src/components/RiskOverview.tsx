import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, BookOpen, Flame } from 'lucide-react';
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

  // High risk: courses not done that block other not-done courses
  const blockingNotDone = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const blocks = (blocksMap.get(c.course_code) || []).filter(b => statusByCode.get(b) !== 'completed');
      return { course: c, blocks };
    })
    .filter(x => x.blocks.length > 0);

  // Top priorities for "Viktigast just nu":
  // 1) High risk (blocking) — phrase as "X spärrar Y"
  // 2) Upcoming with unmet prereqs — phrase as "X kräver Y"
  type Top = { key: string; text: string; helper: string };
  const tops: Top[] = [];
  blockingNotDone.slice(0, 5).forEach(({ course, blocks }) => {
    tops.push({
      key: `t-block-${course.course_code}`,
      text: `${course.course_code} spärrar ${blocks[0]}${blocks.length > 1 ? ` +${blocks.length - 1}` : ''}`,
      helper: 'Prioritera moment i denna kurs',
    });
  });
  unmetPrereqCourses.slice(0, 5).forEach(({ course, unmet }) => {
    tops.push({
      key: `t-prereq-${course.course_code}`,
      text: `${course.course_code} kräver ${unmet[0]}${unmet.length > 1 ? ` +${unmet.length - 1}` : ''}`,
      helper: 'Kommande kurs har ej uppfyllda förkunskaper',
    });
  });
  const topItems = tops.slice(0, 3);

  // Recommendation line based on top blocking courses
  const recCodes = blockingNotDone.slice(0, 2).map(b => b.course.course_code);
  const recommendation = recCodes.length > 0
    ? `Rekommendation: Börja med ${recCodes.join(' och ')} eftersom de påverkar kommande kurser.`
    : null;

  // Grouped expanded lists
  const highRiskList = blockingNotDone.map(({ course, blocks }) => ({
    key: `h-${course.course_code}`,
    text: `${course.course_code} spärrar ${blocks.slice(0, 3).join(', ')}${blocks.length > 3 ? ` +${blocks.length - 3}` : ''}`,
  }));
  const prereqList = unmetPrereqCourses.map(({ course, unmet }) => ({
    key: `p-${course.course_code}`,
    text: `${course.course_code} kräver ${unmet.slice(0, 3).join(', ')}${unmet.length > 3 ? ` +${unmet.length - 3}` : ''}`,
  }));
  // Other risks: overdue not in highRisk and not in prereqList
  const highRiskCodes = new Set(blockingNotDone.map(b => b.course.course_code));
  const prereqCodes = new Set(unmetPrereqCourses.map(p => p.course.course_code));
  const otherList = overdueCourses
    .filter(c => !highRiskCodes.has(c.course_code) && !prereqCodes.has(c.course_code))
    .map(c => ({
      key: `o-${c.course_code}`,
      text: `${c.course_code} från år ${c.year} är inte avklarad`,
    }));

  const noRisks = overdueCourses.length === 0 && unmetPrereqCourses.length === 0 && blockingNotDone.length === 0;

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
                value={unmetPrereqCourses.length}
                emphasize={unmetPrereqCourses.length > 0}
              />
              <MetricCard
                icon={<Flame className="h-4 w-4 text-destructive" />}
                label="Hög risk"
                value={blockingNotDone.length}
                emphasize={blockingNotDone.length > 0}
              />
            </div>

            {/* Viktigast just nu */}
            {topItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Viktigast just nu
                </p>
                <ul className="space-y-2">
                  {topItems.map(t => (
                    <li key={t.key} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium">{t.text}</p>
                        <p className="text-xs text-muted-foreground">{t.helper}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation && (
              <p className="text-xs text-muted-foreground border-l-2 border-warning/60 pl-2">
                {recommendation}
              </p>
            )}

            {/* Expandable grouped details */}
            {compact && (highRiskList.length + prereqList.length + otherList.length > topItems.length) && (
              <>
                {expanded && (
                  <div className="space-y-3 pt-1">
                    {highRiskList.length > 0 && (
                      <Group title="Hög risk" items={highRiskList} dotClass="bg-destructive" />
                    )}
                    {prereqList.length > 0 && (
                      <Group title="Kommande kurser med saknade förkunskaper" items={prereqList} dotClass="bg-warning" />
                    )}
                    {otherList.length > 0 && (
                      <Group title="Övriga risker" items={otherList} dotClass="bg-muted-foreground" />
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
