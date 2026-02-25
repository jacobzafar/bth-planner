import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserData, StudyEvent, EventType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AddEventPageProps {
  userData: UserData;
  onAddEvent: (event: Omit<StudyEvent, 'id'>) => void;
}

export default function AddEventPage({ userData, onAddEvent }: AddEventPageProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState<EventType>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) {
      toast.warning('Warning: Due date is in the past');
    }
    onAddEvent({
      title: title.trim(),
      courseId,
      type,
      dueDate,
      dueTime,
      description: description.trim(),
      status: 'upcoming',
    });
    toast.success('Event saved!');
    navigate('/');
  };

  return (
    <div className="max-w-lg mx-auto md:mt-12 animate-slide-up">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Add Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Assignment 1" required />
            </div>

            <div>
              <Label htmlFor="course">Course *</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {userData.courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">📝 Assignment</SelectItem>
                  <SelectItem value="lab">🧪 Lab</SelectItem>
                  <SelectItem value="exam">📋 Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="dueTime">Due Time</Label>
                <Input id="dueTime" type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes..." rows={3} />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                <Save className="h-4 w-4" /> Save Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
