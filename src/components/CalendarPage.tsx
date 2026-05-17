import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Pencil, Trash2, Save, X, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, subDays, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EventFormFields from '@/components/EventFormFields';
import { EVENT_TYPE_LABEL, EVENT_STATUS_LABEL, parseHpInput } from '@/lib/events';

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => [k, `${typeEmoji(k)} ${v}`]),
);
function typeEmoji(k: string): string {
  switch (k) {
    case 'exam': return '📋';
    case 'assignment': return '📝';
    case 'lab': return '🧪';
    case 'seminar': return '💬';
    case 'lecture': return '🎓';
    default: return '📌';
  }
}
const STATUS_LABEL = EVENT_STATUS_LABEL;

interface CalendarPageProps {
  userId: string;
}

interface StudyEvent {
  id: string;
  title: string;
  event_type: string;
  due_date: string;
  status: string;
  course_code: string | null;
  due_time: string | null;
  description: string | null;
  hp: number | null;
}

interface UserCourse {
  id: string;
  course_code: string;
  course_name: string;
}

const TYPE_LABEL: Record<string, string> = {
  exam: '📋 Tenta',
  assignment: '📝 Uppgift',
  lab: '🧪 Labb',
  seminar: '💬 Seminarium',
  lecture: '🎓 Föreläsning',
  other: '📌 Annat',
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Kommande',
  complete: 'Klar',
  overdue: 'Försenad',
};

export default function CalendarPage({ userId }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [selected, setSelected] = useState<StudyEvent | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // edit form state
  const [fTitle, setFTitle] = useState('');
  const [fCourse, setFCourse] = useState('');
  const [fType, setFType] = useState('assignment');
  const [fDate, setFDate] = useState('');
  const [fTime, setFTime] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fHp, setFHp] = useState('');

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('study_events')
      .select('id, title, event_type, due_date, status, course_code, due_time, description, hp')
      .eq('user_id', userId);
    setEvents((data || []) as StudyEvent[]);
  }, [userId]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  useEffect(() => {
    supabase.from('user_courses').select('id, course_code, course_name').eq('user_id', userId)
      .then(({ data }) => setCourses((data || []) as UserCourse[]));
  }, [userId]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = (getDay(monthStart) + 6) % 7;

  const eventsByDate = useMemo(() => {
    const map = new Map<string, StudyEvent[]>();
    events.forEach(e => {
      if (!map.has(e.due_date)) map.set(e.due_date, []);
      map.get(e.due_date)!.push(e);
    });
    return map;
  }, [events]);

  const typeColor: Record<string, string> = {
    exam: 'bg-red-500',
    assignment: 'bg-blue-500',
    lab: 'bg-green-500',
    seminar: 'bg-purple-500',
    lecture: 'bg-orange-500',
    other: 'bg-gray-400',
  };

  const today = new Date();

  const openEvent = (e: StudyEvent) => {
    setSelected(e);
    setEditing(false);
  };

  const closeDialog = () => {
    setSelected(null);
    setEditing(false);
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
    setEditing(true);
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const newStatus = selected.status === 'complete' ? 'upcoming' : 'complete';
    setSaving(true);
    const { error } = await supabase.from('study_events')
      .update({ status: newStatus }).eq('id', selected.id);
    if (error) { setSaving(false); toast.error('Kunde inte uppdatera status'); return; }
    // Sync linked subtask
    await supabase.from('course_subtasks')
      .update({ completed: newStatus === 'complete' })
      .eq('event_id', selected.id);
    setSaving(false);
    setEvents(prev => prev.map(e => e.id === selected.id ? { ...e, status: newStatus } : e));
    setSelected({ ...selected, status: newStatus });
    toast.success(newStatus === 'complete' ? 'Markerad som klar' : 'Markerad som kommande');
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
    };
    const { error } = await supabase.from('study_events').update(updates).eq('id', selected.id);
    if (error) { setSaving(false); toast.error('Kunde inte spara ändringar'); return; }
    // Sync linked subtask
    await supabase.from('course_subtasks').update({
      title: updates.title,
      due_date: updates.due_date,
      hp: updates.hp,
      type: updates.event_type,
    }).eq('event_id', selected.id);
    setSaving(false);
    const updated = { ...selected, ...updates };
    setEvents(prev => prev.map(ev => ev.id === selected.id ? updated : ev));
    setSelected(updated);
    setEditing(false);
    toast.success('Händelse uppdaterad');
  };

  const doDelete = async () => {
    if (!selected) return;
    setSaving(true);
    // Delete linked subtask first to keep data consistent
    await supabase.from('course_subtasks').delete().eq('event_id', selected.id);
    const { error } = await supabase.from('study_events').delete().eq('id', selected.id);
    setSaving(false);
    setConfirmDelete(false);
    if (error) { toast.error('Kunde inte ta bort'); return; }
    setEvents(prev => prev.filter(e => e.id !== selected.id));
    toast.success('Händelse borttagen');
    closeDialog();
  };

  return (
    <div className="max-w-4xl mx-auto md:mt-12 animate-slide-up">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-heading text-center flex-1">{format(currentMonth, 'MMMM yyyy', { locale: sv })}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end pt-2">
            <Link to="/add-event">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Lägg till händelse
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Tenta</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Uppgift</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Labb</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500" /> Seminarium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> Föreläsning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400" /> Annat</span>
          </div>

          <div className="grid grid-cols-7 gap-px mb-1">
            {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: startPad }).map((_, i) => {
              const padDate = format(subDays(monthStart, startPad - i), 'yyyy-MM-dd');
              return <div key={`pad-${padDate}`} className="min-h-[80px] md:min-h-[100px] bg-muted/30 rounded-sm" />;
            })}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate.get(dateStr) || [];
              const isTodays = isSameDay(day, today);
              return (
                <div
                  key={dateStr}
                  className={`min-h-[80px] md:min-h-[100px] p-1 border rounded-sm ${
                    isTodays ? 'border-primary bg-primary/5' : 'border-transparent'
                  }`}
                >
                  <span className={`text-xs font-medium ${isTodays ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => openEvent(e)}
                        className={`${typeColor[e.event_type] || 'bg-muted'} rounded px-1 py-0.5 text-[10px] leading-tight truncate w-full text-left hover:opacity-80 transition-opacity ${
                          e.status === 'complete' ? 'opacity-40 line-through' : ''
                        }`}
                        style={{ color: 'white' }}
                        title={e.title}
                      >
                        {e.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} till</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-md">
          {selected && !editing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading pr-6">{selected.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">{TYPE_LABEL[selected.event_type] || selected.event_type}</Badge>
                  {selected.course_code && <Badge variant="outline">{selected.course_code}</Badge>}
                  {selected.hp && selected.hp > 0 ? (
                    <Badge variant="outline">{selected.hp} HP</Badge>
                  ) : null}
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
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={toggleStatus} disabled={saving} className="gap-2">
                  {selected.status === 'complete'
                    ? (<><RotateCcw className="h-4 w-4" /> Markera kommande</>)
                    : (<><CheckCircle2 className="h-4 w-4" /> Markera klar</>)}
                </Button>
                <Button variant="outline" onClick={beginEdit} className="gap-2">
                  <Pencil className="h-4 w-4" /> Redigera
                </Button>
                <Button variant="destructive" onClick={() => setConfirmDelete(true)} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Ta bort
                </Button>
              </DialogFooter>
            </>
          )}

          {selected && editing && (
            <form onSubmit={saveEdit} className="space-y-3">
              <DialogHeader>
                <DialogTitle className="font-heading">Redigera händelse</DialogTitle>
              </DialogHeader>
              <div>
                <Label htmlFor="e-title">Titel *</Label>
                <Input id="e-title" value={fTitle} onChange={e => setFTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="e-course">Kurs</Label>
                <Select value={fCourse} onValueChange={setFCourse}>
                  <SelectTrigger><SelectValue placeholder="Välj kurs" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.course_code}>
                        {c.course_code} - {c.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="e-type">Typ</Label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="e-date">Datum *</Label>
                  <Input id="e-date" type="date" value={fDate} onChange={e => setFDate(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="e-time">Tid</Label>
                  <Input id="e-time" type="time" value={fTime} onChange={e => setFTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="e-hp">Omfattning / HP</Label>
                <Input
                  id="e-hp"
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
                <Label htmlFor="e-desc">Beskrivning</Label>
                <Textarea id="e-desc" value={fDesc} onChange={e => setFDesc(e.target.value)} rows={3} />
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

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort händelse?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta går inte att ångra. Händelsen "{selected?.title}" tas bort permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
