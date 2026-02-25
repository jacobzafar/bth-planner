import { useMemo, useState } from 'react';
import { UserData } from '@/lib/types';
import { getPrioritizedEvents } from '@/lib/prioritization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, Plus, Target, CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardProps {
  userData: UserData;
  onCompleteEvent: (id: string) => void;
}

export default function Dashboard({ userData, onCompleteEvent }: DashboardProps) {
  const prioritized = useMemo(
    () => getPrioritizedEvents(userData.events, userData.courses),
    [userData.events, userData.courses]
  );

  const topFive = prioritized.slice(0, 5);

  const now = new Date();
  const thisWeek = userData.events.filter(e => {
    if (e.status === 'complete') return false;
    const due = new Date(e.dueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;
  const nextWeek = userData.events.filter(e => {
    if (e.status === 'complete') return false;
    const due = new Date(e.dueDate);
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  }).length;

  const typeColor: Record<string, string> = {
    assignment: 'bg-info text-info-foreground',
    lab: 'bg-success text-success-foreground',
    exam: 'bg-destructive text-destructive-foreground',
  };

  const formatDueLabel = (dueDate: string, dueTime: string) => {
    const due = new Date(`${dueDate}T${dueTime || '23:59'}`);
    const hours = differenceInHours(due, now);
    if (hours < 0) return 'Overdue!';
    if (hours < 24) return `${hours}h left`;
    if (isToday(due)) return 'Today';
    if (isTomorrow(due)) return 'Tomorrow';
    return format(due, 'EEE, MMM d');
  };

  if (userData.events.length === 0 && userData.courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Welcome to your planner!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start by adding courses and events to see your personalized "Focus Next" dashboard.
        </p>
        <div className="flex gap-3">
          <Link to="/courses">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          </Link>
          <Link to="/add-event">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:mt-12 animate-slide-up">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-info" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{thisWeek}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{nextWeek}</p>
              <p className="text-xs text-muted-foreground">Next week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {userData.events.filter(e => e.status === 'complete').length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{userData.courses.length}</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Next */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-heading">
            <Target className="h-5 w-5 text-primary" />
            Focus Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topFive.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No upcoming events. Add events to see your priorities!
            </p>
          ) : (
            topFive.map((event, i) => {
              const hoursLeft = differenceInHours(
                new Date(`${event.dueDate}T${event.dueTime || '23:59'}`),
                now
              );
              const urgent = hoursLeft < 24;
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
                      <Badge className={`${typeColor[event.type]} text-xs`}>{event.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>📅 {formatDueLabel(event.dueDate, event.dueTime)}</span>
                      {event.course && <span>• {event.course.code}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{event.explanation}"</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCompleteEvent(event.id)}
                    className="shrink-0"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link to="/add-event" className="flex-1">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </Link>
        <Link to="/calendar" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <CalendarDays className="h-4 w-4" /> Calendar
          </Button>
        </Link>
      </div>
    </div>
  );
}
