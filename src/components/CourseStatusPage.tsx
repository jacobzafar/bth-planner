import { useState, useEffect } from 'react';
import { GraduationCap, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourseStatusPageProps {
  userId: string;
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

export default function CourseStatusPage({ userId }: CourseStatusPageProps) {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: true })
      .order('course_name', { ascending: true });

    if (error) {
      toast.error('Kunde inte hämta kurser');
    } else {
      setCourses((data || []) as UserCourse[]);
    }
    setLoading(false);
  };

  const updateStatus = (courseId: string, newStatus: CourseStatus) => {
    setCourses(prev =>
      prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const course of courses) {
        const { error } = await supabase
          .from('user_courses')
          .update({ status: course.status })
          .eq('id', course.id);
        if (error) throw error;
      }
      toast.success('Kursstatus sparad!');
    } catch (error: any) {
      toast.error(error.message || 'Kunde inte spara');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel: Record<CourseStatus, string> = {
    completed: '✅ Helt avklarad',
    partly: '🟡 Delvis avklarad',
    not_started: '⬜ Ej påbörjad',
  };

  const statusColor: Record<CourseStatus, string> = {
    completed: 'bg-success/10 text-success',
    partly: 'bg-warning/10 text-warning',
    not_started: 'bg-muted text-muted-foreground',
  };

  const groupedByYear = courses.reduce((acc, c) => {
    if (!acc[c.year]) acc[c.year] = [];
    acc[c.year].push(c);
    return acc;
  }, {} as Record<number, UserCourse[]>);

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
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Dina kurser</h2>
        <p className="text-muted-foreground mb-6">
          Markera status för varje kurs du har läst hittills.
        </p>

        {Object.entries(groupedByYear)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([year, yearCourses]) => (
            <div key={year} className="mb-6">
              <h3 className="font-heading font-semibold text-foreground mb-3">
                År {year}
              </h3>
              <div className="space-y-2">
                {yearCourses.map(course => (
                  <Card key={course.id}>
                    <CardContent className="p-4 flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">{course.course_code}</span>
                          <Badge variant="outline" className="text-xs">{course.hp} hp</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{course.course_name}</p>
                      </div>
                      <Select
                        value={course.status}
                        onValueChange={(v) => updateStatus(course.id, v as CourseStatus)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">✅ Helt avklarad</SelectItem>
                          <SelectItem value="partly">🟡 Delvis avklarad</SelectItem>
                          <SelectItem value="not_started">⬜ Ej påbörjad</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 text-base mt-4"
        >
          <Save className="h-4 w-4" /> {saving ? 'Sparar...' : 'Spara kursstatus'}
        </Button>
      </main>
    </div>
  );
}
