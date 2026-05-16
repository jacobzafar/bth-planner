import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, Clock, Plus, Target, CalendarDays, BookOpen, TrendingUp, Pencil, Save, X, RotateCcw } from 'lucide-react';
import { format, differenceInHours, isToday, isTomorrow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardProps {
  userId: string;
  totalProgramHp?: number;
}

interface StudyEvent {
  id: string;
  title: string;
  course_code: string | null;
  event_type: string;
  due_date: string;
  due_time: string | null;
  description: string | null;
  status: string;
  hp: number | null;
}

interface CourseData {
  status: string;
  hp: number;
  year: number;
  course_code?: string;
  course_name?: string;
}

interface LinkedSubtask {
  id: string;
  event_id: string | null;
  hp: number;
  completed: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  exam: 'Tenta',
  assignment: 'Uppgift',
  lab: 'Labb',
  seminar: 'Seminarium',
  lecture: 'Föreläsning',
  other: 'Annat',
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Kommande',
  complete: 'Klar',
  overdue: 'Försenad',
};

export default function Dashboard({ userId, totalProgramHp }: DashboardProps) {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [subtasks, setSubtasks] = useState<LinkedSubtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudyEvent | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // edit form state
  const [fTitle, setFTitle] = useState('');
  const [fCourse, setFCourse] = useState('');
  const [fType, setFType] = useState('assignment');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fHp, setFHp] = useState('');
  const [fStatus, setFStatus] = useState('upcoming');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [eventsRes, coursesRes, subtasksRes] = await Promise.all([
      supabase.from('study_events').select('*').eq('user_id', userId).order('due_date', { ascending: true }),
      supabase.from('user_courses').select('status, hp, year, course_code, course_name').eq('user_id', userId),
      supabase.from('course_subtasks').select('id, event_id, hp, completed').eq('user_id', userId),
    ]);

    if (eventsRes.data) setEvents(eventsRes.data as StudyEvent[]);
    if (coursesRes.data) setCourses(coursesRes.data as CourseData[]);
    if (subtasksRes.data) setSubtasks(subtasksRes.data as LinkedSubtask[]);
    setLoading(false);
  };

  const completedHp = courses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.hp, 0);
  const partlyHp = courses.filter(c => c.status === 'partly').reduce((sum, c) => sum + c.hp, 0);
  const totalHp = totalProgramHp || courses.reduce((sum, c) => sum + c.hp, 0);
  const progressPercent = totalHp > 0 ? Math.round((completedHp / totalHp) * 100) : 0;

  const courseStats = {
    total: courses.length,
    completed: courses.filter(c => c.status === 'completed').length,
    partly: courses.filter(c => c.status === 'partly').length,
  };

  const years = [...new Set(courses.map(c => c.year))].sort((a, b) => a - b);
  const hpByYear = years.map(year => {
    const yearCourses = courses.filter(c => c.year === year);
    return {
      year,
      completed: yearCourses.filter(c => c.status === 'completed').reduce((s, c) => s + c.hp, 0),
      total: yearCourses.reduce((s, c) => s + c.hp, 0),
    };
  });

  const now = new Date();
  const upcomingEvents = events.filter(e => e.status !== 'complete' && new Date(e.due_date) >= now);

  const FOCUS_TYPES = new Set(['exam', 'assignment', 'lab']);
  const focusEvents = upcomingEvents.filter(e => {
    if (FOCUS_TYPES.has(e.event_type)) return true;
    // seminar/lecture/other only if HP > 0
    const hp = (e.hp && e.hp > 0) ? Number(e.hp) : (subtasks.find(s => s.event_id === e.id)?.hp || 0);
    return Number(hp) > 0;
  });

  const thisWeek = upcomingEvents.filter(e => {
    const diff = (new Date(e.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const nextWeek = upcomingEvents.filter(e => {
    const diff = (new Date(e.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  }).length;

  const handleComplete = async (id: string) => {
    const { error } = await supabase.from('study_events').update({ status: 'complete' }).eq('id', id);
    if (error) {
      toast.error('Kunde inte uppdatera');
    } else {
      const linkedSubtask = subtasks.find(s => s.event_id === id);
      if (linkedSubtask) {
        await supabase.from('course_subtasks').update({ completed: true }).eq('id', linkedSubtask.id);
      }
      toast.success('Markerad som klar!');
      setSelected(null);
      fetchData();
    }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const newStatus = selected.status === 'complete' ? 'upcoming' : 'complete';
    setSaving(true);
    const { error } = await supabase.from('study_events').update({ status: newStatus }).eq('id', selected.id);
    setSaving(false);
    if (error) { toast.error('Kunde inte uppdatera status'); return; }
    setEvents(prev => prev.map(e => e.id === selected.id ? { ...e, status: newStatus } : e));
    setSelected({ ...selected, status: newStatus });
    toast.success(newStatus === 'complete' ? 'Markerad som klar' : 'Markerad som kommande');
  };

  const beginEdit = () => {
    if (!selected) return;
    setFTitle(selected.title);
    setFCourse(selected.course_code || '');
    setFType(selected.event_type);
    setFDate(selected.due_date);
    setFTime(selected.due_time || '');
    setFDesc(selected.description || '');
    setFHp(selected.hp && selected.hp > 0 ? String(selected.hp) : '');
    setFStatus(selected.status);
    setEditing(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!fTitle.trim() || !fDate) { toast.error('Fyll i alla obligatoriska fält'); return; }
    let hpValue = 0;
    if (fHp.trim()) {
      const parsed = parseFloat(fHp.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0) { toast.error('Ogiltigt HP-värde'); return; }
      hpValue = parsed;
    }
    setSaving(true);
    const updates = {
      title: fTitle.trim(),
      course_code: fCourse || null,
      event_type: fType,
      due_date: fDate,
      due_time: fTime || null,
      description: fDesc.trim() || null,
      hp: hpValue,
      status: fStatus,
    };
    const { error } = await supabase.from('study_events').update(updates).eq('id', selected.id);
    setSaving(false);
    if (error) { toast.error('Kunde inte spara ändringar'); return; }
    const updated = { ...selected, ...updates };
    setEvents(prev => prev.map(ev => ev.id === selected.id ? updated : ev));
    setSelected(updated);
    setEditing(false);
    toast.success('Händelse uppdaterad');
  };

  const typeColor: Record<string, string> = {
    assignment: 'bg-info text-info-foreground',
    lab: 'bg-success text-success-foreground',
    exam: 'bg-destructive text-destructive-foreground',
    seminar: 'bg-primary text-primary-foreground',
    lecture: 'bg-muted text-foreground',
  };

  const getEventHp = (event: StudyEvent): number => {
    if (event.hp && event.hp > 0) return Number(event.hp);
    const linked = subtasks.find(s => s.event_id === event.id);
    return linked ? Number(linked.hp) : 0;
  };

  const hoursUntil = (event: StudyEvent) =>
    differenceInHours(new Date(`${event.due_date}T${event.due_time || '23:59'}`), now);

  // Short, single-line reason for the card
  const getShortReason = (event: StudyEvent): string | null => {
    const h = hoursUntil(event);
    const hp = getEventHp(event);
    const typeName = TYPE_LABEL[event.event_type];
    const course = event.course_code;

    if (h < 0 && course) return `Försenad – ${typeName?.toLowerCase() || 'händelse'} i ${course}`;
    if (h < 0) return 'Försenad deadline';

    if (event.event_type === 'exam' && h < 168 && course) return `Deadline snart – tenta i ${course}`;
    if (event.event_type === 'exam' && course) return `Tenta i ${course}`;

    if (hp >= 3) return course ? `Hög omfattning: ${hp} HP i ${course}` : `Hög omfattning: ${hp} HP`;

    if (event.event_type === 'lab' && h < 168 && course) return `Labb denna vecka i ${course}`;

    if (h < 24 && course) return `Deadline snart i ${course}`;
    if (h < 24) return 'Deadline inom 24h';
    if (h < 72 && course) return `Deadline snart i ${course}`;
    if (h < 72) return 'Deadline inom 3 dagar';
    if (h < 168 && typeName && course) return `${typeName} denna vecka i ${course}`;
    if (h < 168) return 'Deadline denna vecka';

    if (course && typeName) return `${typeName} i ${course}`;
    return null;
  };

  // Detailed bullet reasons for modal — short, natural Swedish
  const getDetailedReasons = (event: StudyEvent): string[] => {
    const reasons: string[] = [];
    const h = hoursUntil(event);
    const hp = getEventHp(event);
    const linkedSubtask = subtasks.find(s => s.event_id === event.id);

    if (h < 0) reasons.push('Deadline har passerat');
    else if (h < 24) reasons.push('Deadline är snart – mindre än ett dygn kvar');
    else if (h < 72) reasons.push('Deadline är snart – inom 3 dagar');
    else if (h < 168) reasons.push('Deadline inom en vecka');

    if (event.event_type === 'exam') reasons.push('Tenta prioriteras högt');
    else if (event.event_type === 'assignment' && hp >= 3) reasons.push('Uppgift med hög omfattning');
    else if (event.event_type === 'assignment') reasons.push('Uppgift med deadline');
    else if (event.event_type === 'lab') reasons.push('Labb kräver förberedelse');

    if (event.course_code) reasons.push(`Kopplad till kursen ${event.course_code}`);
    if (hp > 0) reasons.push(`${hp} HP gör momentet viktigare`);
    if (linkedSubtask && !linkedSubtask.completed) reasons.push('Kopplad till ett kursmoment som inte är avklarat');
    if (event.status && event.status !== 'complete') reasons.push('Inte avklarad ännu');
    return reasons;
  };

  const formatDueLabel = (dueDate: string, dueTime: string | null) => {
    const due = new Date(`${dueDate}T${dueTime || '23:59'}`);
    const hours = differenceInHours(due, now);
    if (hours < 0) return 'Försenad!';
    if (hours < 24) return `${hours}h kvar`;
    if (isToday(due)) return 'Idag';
    if (isTomorrow(due)) return 'Imorgon';
    return format(due, 'EEE d MMM', { locale: sv });
  };

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Laddar...</div>;
  }

  return (
    <div className="space-y-6 md:mt-12 animate-slide-up">
      {/* HP Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-heading">
            <TrendingUp className="h-5 w-5 text-primary" />
            Studieframsteg
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-heading font-bold text-foreground">{completedHp} <span className="text-lg text-muted-foreground font-normal">/ {totalHp} HP</span></span>
              <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            {partlyHp > 0 && (
              <p className="text-xs text-muted-foreground mt-1">+ {partlyHp} HP delvis avklarade</p>
            )}
          </div>

          {hpByYear.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {hpByYear.map(({ year, completed, total }) => (
                <div key={year} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">År {year}</p>
                  <p className="font-heading font-bold text-sm text-foreground">{completed}/{total}</p>
                  <Progress value={total > 0 ? (completed / total) * 100 : 0} className="h-1.5 mt-1" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Snabbstatistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-info" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{thisWeek}</p>
              <p className="text-xs text-muted-foreground">Denna vecka</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{nextWeek}</p>
              <p className="text-xs text-muted-foreground">Nästa vecka</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{courseStats.completed}</p>
              <p className="text-xs text-muted-foreground">Avklarade kurser</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{courseStats.total}</p>
              <p className="text-xs text-muted-foreground">Totalt kurser</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fokus näst */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-heading">
            <Target className="h-5 w-5 text-primary" />
            Fokusera härnäst
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {focusEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Inga kommande händelser. Lägg till händelser för att se dina prioriteringar!
            </p>
          ) : (
            focusEvents.slice(0, 5).map((event, i) => {
              const h = hoursUntil(event);
              const urgent = h < 24 && h >= 0;
              const hp = getEventHp(event);
              const shortReason = getShortReason(event);
              return (
                <button
                  type="button"
                  key={event.id}
                  onClick={() => setSelected(event)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    urgent ? 'border-destructive/30 bg-destructive/5' : 'border-border'
                  }`}
                >
                  <span className="font-heading font-bold text-lg text-muted-foreground w-6 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {urgent && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                      <span className="font-semibold text-sm text-foreground">{event.title}</span>
                      <Badge className={`${typeColor[event.event_type] || 'bg-muted text-muted-foreground'} text-xs`}>
                        {TYPE_LABEL[event.event_type] || event.event_type}
                      </Badge>
                      {hp > 0 && (
                        <Badge variant="outline" className="text-xs">{hp} HP</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📅 {formatDueLabel(event.due_date, event.due_time)}</span>
                      {event.course_code && <span>• {event.course_code}</span>}
                    </div>
                    {shortReason && (
                      <p className="text-xs text-primary/90 mt-1.5 font-medium truncate">
                        {shortReason}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Snabbåtgärder */}
      <div className="flex gap-3">
        <Link to="/add-event" className="flex-1">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" /> Lägg till händelse
          </Button>
        </Link>
        <Link to="/kalender" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <CalendarDays className="h-4 w-4" /> Kalender
          </Button>
        </Link>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setEditing(false); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selected && !editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading pr-6">{selected.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">{TYPE_LABEL[selected.event_type] || selected.event_type}</Badge>
                  {selected.course_code && <Badge variant="outline">{selected.course_code}</Badge>}
                  {getEventHp(selected) > 0 && (
                    <Badge variant="outline">{getEventHp(selected)} HP</Badge>
                  )}
                  <Badge variant={selected.status === 'complete' ? 'default' : 'secondary'}>
                    {STATUS_LABEL[selected.status] || selected.status}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Datum: </span>
                  <span className="font-medium">
                    {format(new Date(selected.due_date), 'EEEE d MMMM yyyy', { locale: sv })}
                  </span>
                </div>
                {selected.due_time && (
                  <div>
                    <span className="text-muted-foreground">Tid: </span>
                    <span className="font-medium">{selected.due_time.slice(0, 5)}</span>
                  </div>
                )}
                {selected.description && (
                  <div className="pt-2">
                    <p className="text-muted-foreground mb-1">Beskrivning</p>
                    <p className="whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}

                <div className="pt-3 border-t mt-3">
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" /> Varför prioriterad?
                  </p>
                  {(() => {
                    const reasons = getDetailedReasons(selected);
                    if (reasons.length === 0) {
                      return <p className="text-muted-foreground text-xs">Ingen särskild prioriteringsfaktor – händelsen visas i kronologisk ordning.</p>;
                    }
                    return (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                      </ul>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={toggleStatus} disabled={saving} className="gap-2">
                  {selected.status === 'complete'
                    ? (<><RotateCcw className="h-4 w-4" /> Markera kommande</>)
                    : (<><CheckCircle2 className="h-4 w-4" /> Markera klar</>)}
                </Button>
                <Button variant="outline" onClick={beginEdit} className="gap-2">
                  <Pencil className="h-4 w-4" /> Redigera
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Stäng</Button>
              </DialogFooter>
            </>
          )}

          {selected && editing && (
            <form onSubmit={saveEdit} className="space-y-3">
              <DialogHeader>
                <DialogTitle className="font-heading">Redigera händelse</DialogTitle>
              </DialogHeader>
              <div>
                <Label htmlFor="d-title">Titel *</Label>
                <Input id="d-title" value={fTitle} onChange={e => setFTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="d-course">Kurs</Label>
                <Select value={fCourse} onValueChange={setFCourse}>
                  <SelectTrigger><SelectValue placeholder="Välj kurs" /></SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter(c => c.course_code && c.course_name)
                      .map(c => (
                        <SelectItem key={c.course_code} value={c.course_code!}>
                          {c.course_code} - {c.course_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="d-type">Typ</Label>
                  <Select value={fType} onValueChange={setFType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">📋 Tenta</SelectItem>
                      <SelectItem value="assignment">📝 Uppgift</SelectItem>
                      <SelectItem value="lab">🧪 Labb</SelectItem>
                      <SelectItem value="seminar">💬 Seminarium</SelectItem>
                      <SelectItem value="lecture">🎓 Föreläsning</SelectItem>
                      <SelectItem value="other">📌 Annat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="d-status">Status</Label>
                  <Select value={fStatus} onValueChange={setFStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Kommande</SelectItem>
                      <SelectItem value="complete">Klar</SelectItem>
                      <SelectItem value="overdue">Försenad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="d-date">Datum *</Label>
                  <Input id="d-date" type="date" value={fDate} onChange={e => setFDate(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="d-time">Tid</Label>
                  <Input id="d-time" type="time" value={fTime} onChange={e => setFTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="d-hp">Omfattning / HP</Label>
                <Input
                  id="d-hp"
                  type="number"
                  step="0.5"
                  min="0"
                  inputMode="decimal"
                  value={fHp}
                  onChange={e => setFHp(e.target.value)}
                  placeholder="t.ex. 1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Används för att prioritera större moment högre.
                </p>
              </div>
              <div>
                <Label htmlFor="d-desc">Beskrivning</Label>
                <Textarea id="d-desc" value={fDesc} onChange={e => setFDesc(e.target.value)} rows={3} />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(false)} className="gap-2">
                  <X className="h-4 w-4" /> Avbryt
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" /> {saving ? 'Sparar...' : 'Spara'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
