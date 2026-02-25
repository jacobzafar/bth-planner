import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, Plus, Target, CalendarDays, BookOpen } from 'lucide-react';
import { format, differenceInHours, isToday, isTomorrow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardProps {
  userId: string;
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
}

interface CourseStats {
  total: number;
  completed: number;
  partly: number;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats>({ total: 0, completed: 0, partly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const [eventsRes, coursesRes] = await Promise.all([
      supabase.from('study_events').select('*').eq('user_id', userId).order('due_date', { ascending: true }),
      supabase.from('user_courses').select('status').eq('user_id', userId),
    ]);

    if (eventsRes.data) setEvents(eventsRes.data as StudyEvent[]);
    if (coursesRes.data) {
      const courses = coursesRes.data;
      setCourseStats({
        total: courses.length,
        completed: courses.filter(c => c.status === 'completed').length,
        partly: courses.filter(c => c.status === 'partly').length,
      });
    }
    setLoading(false);
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => e.status !== 'complete' && new Date(e.due_date) >= now);

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
      toast.success('Markerad som klar!');
      fetchData();
    }
  };

  const typeColor: Record<string, string> = {
    assignment: 'bg-info text-info-foreground',
    lab: 'bg-success text-success-foreground',
    exam: 'bg-destructive text-destructive-foreground',
  };

  const typeLabel: Record<string, string> = {
    assignment: 'Uppgift',
    lab: 'Labb',
    exam: 'Tenta',
    other: 'Övrigt',
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
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Inga kommande händelser. Lägg till händelser för att se dina prioriteringar!
            </p>
          ) : (
            upcomingEvents.slice(0, 5).map((event, i) => {
              const hoursLeft = differenceInHours(
                new Date(`${event.due_date}T${event.due_time || '23:59'}`),
                now
              );
              const urgent = hoursLeft < 24 && hoursLeft >= 0;
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
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
                        {typeLabel[event.event_type] || event.event_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📅 {formatDueLabel(event.due_date, event.due_time)}</span>
                      {event.course_code && <span>• {event.course_code}</span>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleComplete(event.id)}
                    className="shrink-0"
                    title="Markera som klar"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                </div>
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
    </div>
  );
}
