import { useState } from 'react';
import { UserData, Course, CourseImportance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, BookOpen, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CoursesPageProps {
  userData: UserData;
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export default function CoursesPage({ userData, onAddCourse, onUpdateCourse, onDeleteCourse }: CoursesPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [importance, setImportance] = useState<CourseImportance>('medium');

  const resetForm = () => {
    setName('');
    setCode('');
    setBlocking(false);
    setImportance('medium');
  };

  const handleAdd = () => {
    if (!name.trim() || !code.trim()) {
      toast.error('Name and code are required');
      return;
    }
    onAddCourse({ name: name.trim(), code: code.trim(), blocking, importance });
    toast.success('Course added!');
    resetForm();
    setShowAdd(false);
  };

  const handleEdit = () => {
    if (!editingCourse || !name.trim() || !code.trim()) return;
    onUpdateCourse({ ...editingCourse, name: name.trim(), code: code.trim(), blocking, importance });
    toast.success('Course updated!');
    setEditingCourse(null);
    resetForm();
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setBlocking(course.blocking);
    setImportance(course.importance);
  };

  const importanceColor: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-muted text-muted-foreground',
  };

  const courseForm = (
    <div className="space-y-4">
      <div>
        <Label>Course Code *</Label>
        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. PA2576" />
      </div>
      <div>
        <Label>Course Name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Software Development" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> Blocking course
        </Label>
        <Switch checked={blocking} onCheckedChange={setBlocking} />
      </div>
      <div>
        <Label>Importance</Label>
        <Select value={importance} onValueChange={v => setImportance(v as CourseImportance)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">🔴 High</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="low">🟢 Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto md:mt-12 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My Courses</h1>
        <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Add Course</DialogTitle>
            </DialogHeader>
            {courseForm}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => { setShowAdd(false); resetForm(); }} className="flex-1">Cancel</Button>
              <Button onClick={handleAdd} className="flex-1">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => { if (!open) { setEditingCourse(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Course</DialogTitle>
          </DialogHeader>
          {courseForm}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => { setEditingCourse(null); resetForm(); }} className="flex-1">Cancel</Button>
            <Button onClick={handleEdit} className="flex-1">Update</Button>
          </div>
        </DialogContent>
      </Dialog>

      {userData.courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No courses yet. Add your first course!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {userData.courses.map(course => (
            <Card key={course.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-foreground">{course.code}</span>
                    <span className="text-sm text-foreground">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {course.blocking && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Shield className="h-3 w-3" /> Blocking
                      </Badge>
                    )}
                    <Badge className={`text-xs ${importanceColor[course.importance]}`}>
                      {course.importance}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(course)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onDeleteCourse(course.id);
                      toast.success('Course deleted');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
