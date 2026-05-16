import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, User, GraduationCap, AlertTriangle, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { bthPrograms } from '@/lib/programs';
import { estimateStudyYear } from '@/lib/studyYear';

interface SettingsPageProps {
  userId: string;
  email?: string | null;
  programName: string;
  startYear: number;
  onLogout: () => void;
}

interface CourseRow {
  course_code: string;
  course_name: string;
  year: number;
  hp: number;
  status: 'completed' | 'partly' | 'not_started';
}

export default function SettingsPage({ userId, email, programName, startYear, onLogout }: SettingsPageProps) {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('user_courses')
      .select('course_code, course_name, year, hp, status')
      .eq('user_id', userId)
      .then(({ data }) => {
        setCourses((data || []) as CourseRow[]);
        setLoading(false);
      });
  }, [userId]);

  const programTemplate = useMemo(
    () => bthPrograms.find(p => p.name === programName) || null,
    [programName],
  );

  const estimate = useMemo(
    () => (startYear ? estimateStudyYear(startYear) : null),
    [startYear],
  );

  // Maps for prereq/blocking from program template
  const { prereqMap, blocksMap, courseYearMap, nameMap } = useMemo(() => {
    const prereq = new Map<string, string[]>();
    const blocks = new Map<string, string[]>();
    const yearMap = new Map<string, number>();
    const names = new Map<string, string>();
    if (programTemplate) {
      for (const c of programTemplate.courses) {
        yearMap.set(c.code, c.year);
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
    for (const c of courses) {
      if (!names.has(c.course_code)) names.set(c.course_code, c.course_name);
    }
    return { prereqMap: prereq, blocksMap: blocks, courseYearMap: yearMap, nameMap: names };
  }, [programTemplate, courses]);

  const statusByCode = useMemo(() => {
    const m = new Map<string, CourseRow['status']>();
    for (const c of courses) m.set(c.course_code, c.status);
    return m;
  }, [courses]);

  // Stats
  const completedHp = courses.filter(c => c.status === 'completed').reduce((s, c) => s + Number(c.hp || 0), 0);
  const totalUserHp = courses.reduce((s, c) => s + Number(c.hp || 0), 0);
  const totalProgramHp = programTemplate ? programTemplate.courses.reduce((s, c) => s + c.hp, 0) : totalUserHp;
  const progressPct = totalProgramHp > 0 ? Math.round((completedHp / totalProgramHp) * 100) : 0;

  // Risks
  const currentStudyYear = estimate?.year ?? 1;
  const overdueCourses = courses.filter(
    c => c.year <= currentStudyYear && c.status !== 'completed',
  );

  // Courses with unmet prereqs (only future/current courses still not completed)
  const unmetPrereqCourses = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const prereqs = prereqMap.get(c.course_code) || [];
      const unmet = prereqs.filter(p => statusByCode.get(p) !== 'completed');
      return { course: c, unmet };
    })
    .filter(x => x.unmet.length > 0);

  // Not-completed courses that block upcoming courses
  const blockingNotDone = courses
    .filter(c => c.status !== 'completed')
    .map(c => {
      const blocks = (blocksMap.get(c.course_code) || []).filter(b => {
        const st = statusByCode.get(b);
        return !st || st !== 'completed';
      });
      return { course: c, blocks };
    })
    .filter(x => x.blocks.length > 0);

  return (
    <div className="max-w-2xl mx-auto md:mt-12 animate-slide-up space-y-4 px-1">
      <h1 className="font-heading text-2xl font-bold text-foreground">Inställningar</h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Konto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">E-post</span>
            <span className="text-sm text-foreground font-medium text-right truncate">
              {email || 'Okänd'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary">Inloggad</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Study plan */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Studieplan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-muted-foreground shrink-0">Program</span>
            <span className="text-sm text-foreground font-medium text-right">{programName || 'Inget valt'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Startår</span>
            <span className="text-sm text-foreground">{startYear || '–'}</span>
          </div>
          {estimate && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-muted-foreground shrink-0">Just nu</span>
              <span className="text-sm text-foreground text-right">
                {estimate.uncertain ? estimate.label : (
                  <>Du går troligen <span className="font-medium">år {estimate.year}</span> ({estimate.semester === 1 ? 'HT' : 'VT'})</>
                )}
              </span>
            </div>
          )}
          {programTemplate && (
            <div className="pt-2 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Kurser</p>
                <p className="text-sm font-semibold">{courses.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HP klara</p>
                <p className="text-sm font-semibold">{completedHp}/{totalProgramHp}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Framsteg</p>
                <p className="text-sm font-semibold">{progressPct}%</p>
              </div>
            </div>
          )}
          {programTemplate && (
            <Progress value={progressPct} className="h-1.5" />
          )}
        </CardContent>
      </Card>

      {/* Risk overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Riskbild & framsteg
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Laddar...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Ej avklarade från tidigare/nuvarande år</p>
                  <p className="text-xl font-bold text-foreground">{overdueCourses.length}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Kurser med ej uppfyllda förkunskaper</p>
                  <p className="text-xl font-bold text-foreground">{unmetPrereqCourses.length}</p>
                </div>
              </div>

              {overdueCourses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Ej avklarade kurser från tidigare år
                  </p>
                  <ul className="space-y-1 text-sm">
                    {overdueCourses.slice(0, 5).map(c => {
                      const blocks = (blocksMap.get(c.course_code) || []);
                      return (
                        <li key={c.course_code} className="text-muted-foreground">
                          <span className="font-mono text-foreground">{c.course_code}</span>{' '}
                          är inte avklarad
                          {blocks.length > 0 && ' och kan påverka kommande kurser'}
                        </li>
                      );
                    })}
                    {overdueCourses.length > 5 && (
                      <li className="text-xs text-muted-foreground">+{overdueCourses.length - 5} till</li>
                    )}
                  </ul>
                </div>
              )}

              {unmetPrereqCourses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Kommande kurser med ej uppfyllda förkunskaper
                  </p>
                  <ul className="space-y-1 text-sm">
                    {unmetPrereqCourses.slice(0, 5).map(({ course, unmet }) => (
                      <li key={course.course_code} className="text-muted-foreground">
                        <span className="font-mono text-foreground">{course.course_code}</span>{' '}
                        kräver {unmet.map(u => (
                          <span key={u} className="font-mono text-foreground">{u}</span>
                        )).reduce<React.ReactNode[]>((acc, el, i) => {
                          if (i > 0) acc.push(', ');
                          acc.push(el);
                          return acc;
                        }, [])}
                      </li>
                    ))}
                    {unmetPrereqCourses.length > 5 && (
                      <li className="text-xs text-muted-foreground">+{unmetPrereqCourses.length - 5} till</li>
                    )}
                  </ul>
                </div>
              )}

              {blockingNotDone.length > 0 && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  Tips: Prioritera moment i kurser som spärrar kommande kurser för att inte halka efter.
                </p>
              )}

              {overdueCourses.length === 0 && unmetPrereqCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">Inga risker upptäckta just nu. Bra jobbat!</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Åtgärder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={onLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" /> Logga ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
