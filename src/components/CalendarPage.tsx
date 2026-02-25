import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface CalendarPageProps {
  userId: string;
}

interface StudyEvent {
  id: string;
  title: string;
  event_type: string;
  due_date: string;
  status: string;
}

export default function CalendarPage({ userId }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<StudyEvent[]>([]);

  useEffect(() => {
    supabase.from('study_events').select('id, title, event_type, due_date, status').eq('user_id', userId)
      .then(({ data }) => setEvents((data || []) as StudyEvent[]));
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
    assignment: 'bg-info',
    lab: 'bg-success',
    exam: 'bg-destructive',
  };

  const today = new Date();

  return (
    <div className="max-w-4xl mx-auto md:mt-12 animate-slide-up">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="font-heading">{format(currentMonth, 'MMMM yyyy', { locale: sv })}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-info" /> Uppgift</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success" /> Labb</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive" /> Tenta</span>
          </div>

          <div className="grid grid-cols-7 gap-px mb-1">
            {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px] md:min-h-[100px] bg-muted/30 rounded-sm" />
            ))}
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
                      <div
                        key={e.id}
                        className={`${typeColor[e.event_type] || 'bg-muted'} rounded px-1 py-0.5 text-[10px] leading-tight truncate ${
                          e.status === 'complete' ? 'opacity-40 line-through' : ''
                        }`}
                        style={{ color: 'white' }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
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
    </div>
  );
}
