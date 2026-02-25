import { useState } from 'react';
import { GraduationCap, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bthPrograms } from '@/lib/programs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProgramSetupPageProps {
  userId: string;
  onComplete: () => void;
}

export default function ProgramSetupPage({ userId, onComplete }: ProgramSetupPageProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [startYear, setStartYear] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const filteredPrograms = bthPrograms.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = async () => {
    if (selected === null || !startYear) {
      toast.error('Välj program och startår');
      return;
    }

    setLoading(true);
    try {
      const program = bthPrograms[selected];
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          program_name: program.name, 
          start_year: parseInt(startYear),
          setup_complete: true 
        })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Calculate which years the student has completed based on start year
      const yearsStudied = currentYear - parseInt(startYear);

      // Insert all courses from the program for years up to current
      const coursesToInsert = program.courses
        .filter(c => c.year <= Math.max(yearsStudied, 1) + 1) // Include current + next year
        .map(c => ({
          user_id: userId,
          course_code: c.code,
          course_name: c.name,
          year: c.year,
          hp: c.hp,
          status: 'not_started' as const,
        }));

      if (coursesToInsert.length > 0) {
        const { error: coursesError } = await supabase
          .from('user_courses')
          .insert(coursesToInsert);
        if (coursesError) throw coursesError;
      }

      toast.success('Program valt!');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-6 flex items-center gap-2">
        <GraduationCap className="h-7 w-7 text-primary" />
        <span className="font-heading font-bold text-xl text-foreground">BTH Studieplanerare</span>
      </header>

      <main className="container max-w-2xl py-8 animate-slide-up">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Välj ditt program</h2>
        <p className="text-muted-foreground mb-6">Välj ditt BTH-program och det år du började studera.</p>

        <div className="mb-4">
          <Label>Startår</Label>
          <Select value={startYear} onValueChange={setStartYear}>
            <SelectTrigger>
              <SelectValue placeholder="Välj startår..." />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 mb-4">
          {filteredPrograms.map((program, i) => {
            const originalIndex = bthPrograms.indexOf(program);
            return (
              <Card
                key={i}
                onClick={() => setSelected(originalIndex)}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selected === originalIndex ? 'ring-2 ring-primary bg-secondary' : ''
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{program.name}</p>
                    <p className="text-xs text-muted-foreground">{program.courses.length} kurser</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === originalIndex ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selected === originalIndex && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          size="lg"
          onClick={handleContinue}
          disabled={selected === null || !startYear || loading}
          className="w-full gap-2 text-base"
        >
          {loading ? 'Sparar...' : 'Fortsätt'} <ChevronRight className="h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}
