import { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Save, Lock, ArrowRight, AlertCircle, Trash2, Plus, Search, X, ChevronDown, ChevronRight, Check, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { bthPrograms } from '@/lib/programs';

interface CourseStatusPageProps {
  userId: string;
  programName?: string;
}

type CourseStatus = 'completed' | 'partly' | 'not_started';

interface UserCourse {
  id: string;
  course_code: string;
  course_name: string;
  year: number;
  hp: number;
  status: CourseStatus;
}

interface Subtask {
  id: string;
  course_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  hp: number;
  event_id: string | null;
}

export default function CourseStatusPage({ userId, programName }: CourseStatusPageProps) {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addYear, setAddYear] = useState('1');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [newSubtaskText, setNewSubtaskText] = useState<Record<string, string>>({});
  const [newSubtaskDate, setNewSubtaskDate] = useState<Record<string, string>>({});
  const [newSubtaskHp, setNewSubtaskHp] = useState<Record<string, string>>({});

  const programTemplate = useMemo(() => {
    if (!programName) return null;
    return bthPrograms.find(p => p.name === programName) || null;
  }, [programName]);

  const allBthCourses = useMemo(() => {
    const map = new Map<string, { name: string; code: string; hp: number }>();
    for (const program of bthPrograms) {
      for (const course of program.courses) {
        if (!map.has(course.code)) {
          map.set(course.code, { name: course.name, code: course.code, hp: course.hp });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, []);

  const availableCourses = useMemo(() => {
    const userCodes = new Set(courses.map(c => c.course_code));
    return allBthCourses.filter(c => !userCodes.has(c.code));
  }, [allBthCourses, courses]);

  const filteredAvailable = useMemo(() => {
    if (!addSearch) return availableCourses.slice(0, 50);
    const q = addSearch.toLowerCase();
    return availableCourses.filter(c =>
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [availableCourses, addSearch]);

  const prereqMap = useMemo(() => {
    if (!programTemplate) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    for (const course of programTemplate.courses) {
      if (course.prerequisites && course.prerequisites.length > 0) {
        map.set(course.code, course.prerequisites);
      }
    }
    return map;
  }, [programTemplate]);

  const blocksMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!programTemplate) return map;
    for (const course of programTemplate.courses) {
      if (course.prerequisites) {
        for (const prereq of course.prerequisites) {
          if (!map.has(prereq)) map.set(prereq, []);
          map.get(prereq)!.push(course.code);
        }
      }
    }
    return map;
  }, [programTemplate]);

  const courseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (programTemplate) {
      for (const c of programTemplate.courses) map.set(c.code, c.name);
    }
    for (const c of courses) map.set(c.course_code, c.course_name);
    for (const c of allBthCourses) { if (!map.has(c.code)) map.set(c.code, c.name); }
    return map;
  }, [programTemplate, courses, allBthCourses]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [coursesRes, subtasksRes] = await Promise.all([
      supabase.from('user_courses').select('*').eq('user_id', userId)
        .order('year', { ascending: true }).order('course_name', { ascending: true }),
      supabase.from('course_subtasks').select('id, course_id, title, completed').eq('user_id', userId)
        .order('created_at', { ascending: true }),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data as UserCourse[]);
    if (subtasksRes.data) setSubtasks(subtasksRes.data as Subtask[]);
    setLoading(false);
  };

  const updateStatus = (courseId: string, newStatus: CourseStatus) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
  };

  const toggleExpanded = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId); else next.add(courseId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const course of courses) {
        const { error } = await supabase.from('user_courses').update({ status: course.status }).eq('id', course.id);
        if (error) throw error;
      }
      toast.success('Kursstatus sparad!');
    } catch (error: any) {
      toast.error(error.message || 'Kunde inte spara');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: string, courseName: string) => {
    const { error } = await supabase.from('user_courses').delete().eq('id', courseId);
    if (error) {
      toast.error('Kunde inte ta bort kursen');
    } else {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSubtasks(prev => prev.filter(s => s.course_id !== courseId));
      toast.success(`${courseName} borttagen`);
    }
  };

  const handleAddCourse = async (course: { code: string; name: string; hp: number }) => {
    const year = parseInt(addYear);
    const { data, error } = await supabase.from('user_courses').insert({
      user_id: userId, course_code: course.code, course_name: course.name,
      hp: course.hp, year, status: 'not_started',
    }).select().single();

    if (error) {
      toast.error('Kunde inte lägga till kursen');
    } else if (data) {
      setCourses(prev => [...prev, data as UserCourse]);
      toast.success(`${course.name} tillagd i år ${year}`);
    }
  };

  const handleAddSubtask = async (courseId: string) => {
    const text = (newSubtaskText[courseId] || '').trim();
    if (!text) return;

    const { data, error } = await supabase.from('course_subtasks').insert({
      user_id: userId, course_id: courseId, title: text,
    }).select('id, course_id, title, completed').single();

    if (error) {
      toast.error('Kunde inte lägga till delmoment');
    } else if (data) {
      setSubtasks(prev => [...prev, data as Subtask]);
      setNewSubtaskText(prev => ({ ...prev, [courseId]: '' }));
    }
  };

  const toggleSubtask = async (subtask: Subtask) => {
    const newCompleted = !subtask.completed;
    const { error } = await supabase.from('course_subtasks')
      .update({ completed: newCompleted }).eq('id', subtask.id);

    if (!error) {
      setSubtasks(prev => prev.map(s => s.id === subtask.id ? { ...s, completed: newCompleted } : s));
    }
  };

  const deleteSubtask = async (id: string) => {
    const { error } = await supabase.from('course_subtasks').delete().eq('id', id);
    if (!error) {
      setSubtasks(prev => prev.filter(s => s.id !== id));
    }
  };

  const getPrereqStatus = (courseCode: string) => {
    const prereqs = prereqMap.get(courseCode);
    if (!prereqs || prereqs.length === 0) return null;
    const unmetPrereqs = prereqs.filter(prereqCode => {
      const course = courses.find(c => c.course_code === prereqCode);
      return !course || course.status !== 'completed';
    });
    return { prereqs, unmetPrereqs, allMet: unmetPrereqs.length === 0 };
  };

  const groupedByYear = courses.reduce((acc, c) => {
    if (!acc[c.year]) acc[c.year] = [];
    acc[c.year].push(c);
    return acc;
  }, {} as Record<number, UserCourse[]>);

  const yearHpStats = Object.entries(groupedByYear).map(([year, yearCourses]) => ({
    year: Number(year),
    completed: yearCourses.filter(c => c.status === 'completed').reduce((s, c) => s + c.hp, 0),
    total: yearCourses.reduce((s, c) => s + c.hp, 0),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar kurser...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-6 flex items-center gap-2">
        <GraduationCap className="h-7 w-7 text-primary" />
        <span className="font-heading font-bold text-xl text-foreground">BTH Studieplanerare</span>
      </header>

      <main className="container max-w-2xl py-4 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">Dina kurser</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Lägg till kurs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Lägg till kurs</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Sök kurskod eller kursnamn..." value={addSearch}
                    onChange={e => setAddSearch(e.target.value)} className="pl-10" />
                  {addSearch && (
                    <button onClick={() => setAddSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Lägg till i år:</span>
                  <Select value={addYear} onValueChange={setAddYear}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {addSearch ? 'Inga kurser hittades' : 'Alla kurser är redan tillagda'}
                    </p>
                  ) : (
                    filteredAvailable.map(course => (
                      <div key={course.code} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground">{course.code}</span>
                            <Badge variant="outline" className="text-xs">{course.hp} hp</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{course.name}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleAddCourse(course)} className="shrink-0 gap-1">
                          <Plus className="h-3 w-3" /> Lägg till
                        </Button>
                      </div>
                    ))
                  )}
                  {filteredAvailable.length >= 50 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Visar max 50 resultat. Använd sökning för att hitta fler.</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground mb-6">
          Markera status och hantera delmoment för varje kurs.
        </p>

        <TooltipProvider>
          {Object.entries(groupedByYear)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, yearCourses]) => {
              const stats = yearHpStats.find(s => s.year === Number(year));
              const yearProgress = stats ? (stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0) : 0;

              return (
                <div key={year} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold text-foreground">År {year}</h3>
                    <span className="text-xs text-muted-foreground">{stats?.completed}/{stats?.total} HP ({yearProgress}%)</span>
                  </div>
                  <Progress value={yearProgress} className="h-1.5 mb-3" />
                  <div className="space-y-2">
                    {yearCourses.map(course => {
                      const prereqStatus = getPrereqStatus(course.course_code);
                      const blocks = blocksMap.get(course.course_code);
                      const hasPrereqInfo = prereqStatus || (blocks && blocks.length > 0);
                      const courseSubtasks = subtasks.filter(s => s.course_id === course.id);
                      const completedSubs = courseSubtasks.filter(s => s.completed).length;
                      const isExpanded = expandedCourses.has(course.id);

                      return (
                        <Card key={course.id} className={prereqStatus && !prereqStatus.allMet && course.status === 'not_started' ? 'border-warning/30' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex-1 min-w-[180px]">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-foreground">{course.course_code}</span>
                                  <Badge variant="outline" className="text-xs">{course.hp} hp</Badge>
                                  {courseSubtasks.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {completedSubs}/{courseSubtasks.length} delmoment
                                    </Badge>
                                  )}
                                  {prereqStatus && !prereqStatus.allMet && course.status === 'not_started' && (
                                    <Tooltip>
                                      <TooltipTrigger><AlertCircle className="h-4 w-4 text-warning" /></TooltipTrigger>
                                      <TooltipContent><p>Förkunskapskrav ej uppfyllda</p></TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{course.course_name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select value={course.status} onValueChange={(v) => updateStatus(course.id, v as CourseStatus)}>
                                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="completed">✅ Helt avklarad</SelectItem>
                                    <SelectItem value="partly">🟡 Delvis avklarad</SelectItem>
                                    <SelectItem value="not_started">⬜ Ej påbörjad</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                      onClick={() => handleDelete(course.id, course.course_name)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ta bort kurs</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            {hasPrereqInfo && (
                              <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                                {prereqStatus && prereqStatus.prereqs.length > 0 && (
                                  <div className="flex items-start gap-1.5 text-xs">
                                    <Lock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                      Förkunskapskrav:{' '}
                                      {prereqStatus.prereqs.map((code, i) => {
                                        const met = !prereqStatus.unmetPrereqs.includes(code);
                                        return (
                                          <span key={code}>
                                            {i > 0 && ', '}
                                            <span className={met ? 'text-success' : 'text-warning font-medium'}>
                                              {code}{courseNameMap.get(code) ? ` (${courseNameMap.get(code)})` : ''}
                                            </span>
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                                {blocks && blocks.length > 0 && (
                                  <div className="flex items-start gap-1.5 text-xs">
                                    <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                    <span className="text-muted-foreground">
                                      Spärrar:{' '}
                                      {blocks.map((code, i) => (
                                        <span key={code}>{i > 0 && ', '}{code}{courseNameMap.get(code) ? ` (${courseNameMap.get(code)})` : ''}</span>
                                      ))}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Subtasks section */}
                            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(course.id)}>
                              <CollapsibleTrigger asChild>
                                <button className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50 w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  Delmoment ({courseSubtasks.length})
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 space-y-1.5">
                                {courseSubtasks.map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2 group">
                                    <button onClick={() => toggleSubtask(sub)} className="shrink-0">
                                      {sub.completed ? (
                                        <Check className="h-4 w-4 text-success" />
                                      ) : (
                                        <Square className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </button>
                                    <span className={`text-sm flex-1 ${sub.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                      {sub.title}
                                    </span>
                                    <button
                                      onClick={() => deleteSubtask(sub.id)}
                                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Lägg till delmoment..."
                                    value={newSubtaskText[course.id] || ''}
                                    onChange={e => setNewSubtaskText(prev => ({ ...prev, [course.id]: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(course.id); } }}
                                    className="h-8 text-sm"
                                  />
                                  <Button size="sm" variant="ghost" className="h-8 px-2 shrink-0"
                                    onClick={() => handleAddSubtask(course.id)} disabled={!(newSubtaskText[course.id] || '').trim()}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </TooltipProvider>

        <Button size="lg" onClick={handleSave} disabled={saving} className="w-full gap-2 text-base mt-4">
          <Save className="h-4 w-4" /> {saving ? 'Sparar...' : 'Spara kursstatus'}
        </Button>
      </main>
    </div>
  );
}
