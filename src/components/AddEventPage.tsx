import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AddEventPageProps {
  userId: string;
}

interface UserCourse {
  id: string;
  course_code: string;
  course_name: string;
}

export default function AddEventPage({ userId }: AddEventPageProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [type, setType] = useState('assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('user_courses').select('id, course_code, course_name').eq('user_id', userId)
      .then(({ data }) => setCourses((data || []) as UserCourse[]));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error('Fyll i alla obligatoriska fält');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      toast.warning('Varning: Datumet har redan passerat');
    }
    setLoading(true);
    const { error } = await supabase.from('study_events').insert({
      user_id: userId,
      title: title.trim(),
      course_code: courseCode || null,
      event_type: type,
      due_date: dueDate,
      due_time: dueTime || null,
      description: description.trim() || null,
      status: 'upcoming',
    });

    if (error) {
      toast.error('Kunde inte spara händelsen');
    } else {
      toast.success('Händelse sparad!');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto md:mt-12 animate-slide-up">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Tillbaka
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Lägg till händelse</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="t.ex. Inlämning 1" required />
            </div>

            <div>
              <Label htmlFor="course">Kurs</Label>
              <Select value={courseCode} onValueChange={setCourseCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj kurs" />
                </SelectTrigger>
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
              <Label htmlFor="type">Typ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">📝 Uppgift</SelectItem>
                  <SelectItem value="lab">🧪 Labb</SelectItem>
                  <SelectItem value="exam">📋 Tenta</SelectItem>
                  <SelectItem value="other">📌 Övrigt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dueDate">Datum *</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="dueTime">Tid</Label>
                <Input id="dueTime" type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="desc">Beskrivning</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Valfria anteckningar..." rows={3} />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Avbryt
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                <Save className="h-4 w-4" /> {loading ? 'Sparar...' : 'Spara'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
